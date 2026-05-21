"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CAMPUS_LOCATIONS,
  type CampusLocation,
  findNearestCampusLocation,
} from "@/app/data/campus-locations";
import { requestCampusRoute } from "@/app/data/campus-route-api";

type LocationField = "start" | "destination";

const LocationPickerMap = dynamic(
  () =>
    import("@/app/components/location-picker-map").then(
      (m) => m.LocationPickerMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-sm font-semibold text-white/70">
        Loading map...
      </div>
    ),
  },
);

function FieldInput({
  value,
  placeholder,
  active,
  autoFocus = false,
  onFocus,
  onChange,
}: {
  value: string;
  placeholder: string;
  active?: boolean;
  autoFocus?: boolean;
  onFocus: () => void;
  onChange: (value: string) => void;
}) {
  const color = active
    ? "border-[#5f86dc]/50 bg-[#2f5eb8]/95 caret-[#9bbdff]"
    : "border-[#8ea3bd]/35 bg-[#536983]/72 caret-white";

  return (
    <input
      type="search"
      value={value}
      autoFocus={autoFocus}
      enterKeyHint="search"
      placeholder={placeholder}
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
      className={`h-[42px] w-full rounded-full border px-[27px] text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none transition-colors placeholder:text-white/36 focus:border-white/30 [&::-webkit-search-cancel-button]:brightness-0 [&::-webkit-search-cancel-button]:invert ${color}`}
    />
  );
}

function Background() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[235px] bg-[radial-gradient(circle_at_12%_0%,rgba(72,131,237,0.96),rgba(35,76,153,0.5)_45%,rgba(6,17,35,0)_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[520px] bg-[radial-gradient(circle_at_88%_80%,rgba(72,131,237,0.98),rgba(65,120,216,0.55)_34%,rgba(22,31,51,0)_72%)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-[128px] bg-[linear-gradient(90deg,rgba(2,9,22,0.72),rgba(2,9,22,0))]" />
    </>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [activeField, setActiveField] = useState<LocationField>("start");
  const [isPickingMap, setIsPickingMap] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [pickedStart, setPickedStart] = useState<[number, number] | null>(null);
  const [pickedDestination, setPickedDestination] = useState<
    [number, number] | null
  >(null);

  const canContinue = Boolean(start && destination);

  const activeTitle = useMemo(
    () => (activeField === "start" ? "Set Lokasi Awal" : "Set Tujuan"),
    [activeField],
  );

  const selectLocation = (location: CampusLocation) => {
    if (activeField === "start") {
      setStart(location.name);
      setPickedStart(location.position);
      setActiveField("destination");
      return;
    }

    setDestination(location.name);
    setPickedDestination(location.position);
  };

  const applyMapPick = (position: [number, number]) => {
    const nearestLocation = findNearestCampusLocation(position);

    if (activeField === "start") {
      setStart(nearestLocation.name);
      setPickedStart(nearestLocation.position);
      setActiveField("destination");
    } else {
      setDestination(nearestLocation.name);
      setPickedDestination(nearestLocation.position);
    }

    setIsPickingMap(false);
  };

  const handleContinue = async () => {
    if (!canContinue || isRouting) return;

    setIsRouting(true);
    setRouteError("");

    try {
      const result = await requestCampusRoute({
        start,
        goal: destination,
        mode: "flat",
      });

      window.sessionStorage.setItem(
        "itbypass:lastRoute",
        JSON.stringify(result),
      );

      router.push(
        `/route?start=${encodeURIComponent(start)}&goal=${encodeURIComponent(
          destination,
        )}`,
      );
    } catch (caught) {
      setRouteError(
        caught instanceof Error
          ? caught.message
          : "Gagal menghitung rute dari backend",
      );
    } finally {
      setIsRouting(false);
    }
  };

  if (isPickingMap) {
    return (
      <main className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-[#061123] text-white">
        <LocationPickerMap
          activeField={activeField}
          locations={CAMPUS_LOCATIONS}
          start={pickedStart}
          destination={pickedDestination}
          onPick={applyMapPick}
          onLocationPick={(location) => {
            selectLocation(location);
            setIsPickingMap(false);
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-[#061123]/95 via-[#061123]/65 to-transparent" />

        <div className="pointer-events-auto absolute inset-x-4 top-[max(18px,env(safe-area-inset-top))] z-20">
          <div className="rounded-[24px] border border-white/18 bg-[#343747]/88 px-4 py-4 shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPickingMap(false)}
                aria-label="Close map picker"
                className="-ml-1 rounded-full p-1 text-white transition-colors hover:bg-white/10"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.3"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <h1 className="text-[20px] font-bold tracking-[-0.03em]">
                Pilih lewat peta
              </h1>
            </div>

            <div className="grid grid-cols-2 rounded-full border border-white/12 bg-[#536983]/72 p-1">
              <button
                type="button"
                onClick={() => setActiveField("start")}
                className={`h-9 rounded-full text-[13px] font-bold transition-colors ${activeField === "start"
                  ? "bg-[#2f5eb8] text-white"
                  : "text-white/58"
                  }`}
              >
                Lokasi awal
              </button>
              <button
                type="button"
                onClick={() => setActiveField("destination")}
                className={`h-9 rounded-full text-[13px] font-bold transition-colors ${activeField === "destination"
                  ? "bg-[#2f5eb8] text-white"
                  : "text-white/58"
                  }`}
              >
                Tujuan
              </button>
            </div>

            <p className="mt-3 text-[12px] font-semibold text-white/62">
              Tap titik pada OpenStreetMap untuk memilih{" "}
              {activeField === "start" ? "lokasi awal" : "tujuan"}.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-[#061123] text-white">
      <Background />

      <section className="relative z-10 mx-[4px] flex min-h-0 flex-1 flex-col rounded-b-[22px] border-b border-l border-r border-white/28 bg-[linear-gradient(160deg,rgba(63,65,80,0.94),rgba(55,57,70,0.93)_45%,rgba(65,93,154,0.82)_100%)] px-[17px] pb-[18px] pt-[56px] shadow-[0_14px_28px_rgba(0,0,0,0.2)]">
        <div className="mb-[18px] flex items-center gap-2">
          <Link
            href="/home"
            aria-label="Close search"
            className="-ml-1 rounded-full p-1 text-white transition-colors hover:bg-white/10"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.3"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Link>
          <h1 className="text-[20px] font-bold tracking-[-0.03em]">
            {activeTitle}
          </h1>
        </div>

        <div className="space-y-[9px]">
          <FieldInput
            value={start}
            placeholder="Lokasi Awal"
            active={activeField === "start"}
            autoFocus
            onFocus={() => setActiveField("start")}
            onChange={setStart}
          />
          <FieldInput
            value={destination}
            placeholder="Lokasi Tujuan"
            active={activeField === "destination"}
            onFocus={() => setActiveField("destination")}
            onChange={setDestination}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsPickingMap(true)}
          className="mt-[14px] inline-flex h-[36px] w-fit items-center gap-[4px] rounded-full border border-white/20 bg-[#55637c]/80 px-[16px] text-[12px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-[#61718c]/85"
        >
          <svg
            aria-hidden
            width="16"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          >
            <path d="M12 21s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          Pilih di Maps
        </button>

        <div className="mt-[18px] min-h-0 overflow-y-auto border-t border-white/35 pr-[3px] [scrollbar-color:rgba(255,255,255,0.78)_rgba(18,24,38,0.55)] [scrollbar-width:thin]">
          <ul className="divide-y divide-white/25 border-b border-white/25">
            {CAMPUS_LOCATIONS.map((location) => (
              <li key={location.name}>
                <button
                  type="button"
                  onClick={() => selectLocation(location)}
                  className="grid w-full grid-cols-[42px_1fr] gap-2 py-[8px] pl-[14px] pr-[8px] text-left transition-colors hover:bg-white/5 active:bg-white/10"
                >
                  <span className="flex flex-col leading-none">
                    <span className="text-[24px] font-bold tracking-[-0.06em]">
                      {location.distance}
                    </span>
                    <span className="mt-[5px] text-[10px] font-semibold">
                      km
                    </span>
                  </span>
                  <span className="min-w-0 pt-[3px]">
                    <span className="block truncate text-[14px] font-bold">
                      {location.name}
                    </span>
                    <span className="mt-[4px] block truncate text-[11px] font-semibold text-white/48">
                      {location.address}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {routeError && (
          <p className="mx-auto mt-[10px] max-w-[260px] text-center text-[11px] font-semibold text-red-100">
            {routeError}
          </p>
        )}

        <button
          type="button"
          disabled={!canContinue || isRouting}
          onClick={handleContinue}
          className="mx-auto mt-[15px] h-[100px] w-[140px] rounded-full border border-white/18 bg-[#72809b]/58 text-[15px] font-semibold text-white/28 shadow-[0_5px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] transition-[background-color,transform,color] duration-200 enabled:bg-[#2f5eb8] enabled:text-white enabled:hover:bg-[#3b6cc8] enabled:active:scale-[0.97]"
        >
          {isRouting ? "..." : "Lanjut"}
        </button>
      </section>

      <div className="relative z-10 flex h-[58px] shrink-0 items-center justify-center">
        <p className="text-[20px] font-bold tracking-[-0.03em]">ITBypass</p>
      </div>
    </main>
  );
}
