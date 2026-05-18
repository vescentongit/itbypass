"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type RouteApiResult,
  type RouteMode,
  requestCampusRoute,
} from "@/app/data/campus-route-api";

const RouteResultMap = dynamic(
  () =>
    import("@/app/components/route-result-map").then((m) => m.RouteResultMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-sm font-semibold text-zinc-600">
        Loading map...
      </div>
    ),
  },
);

const ROUTE_OPTIONS: { mode: RouteMode; title: string; subtitle: string }[] = [
  {
    mode: "fast",
    title: "Tercepat",
    subtitle: "elevasi tidak dipedulikan",
  },
  {
    mode: "flat",
    title: "Terlandai",
    subtitle: "elevasi terendah",
  },
];

function readStoredRoute() {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem("itbypass:lastRoute");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RouteApiResult;
  } catch {
    return null;
  }
}

export function RoutePageClient() {
  const searchParams = useSearchParams();
  const start = searchParams.get("start") ?? "";
  const goal = searchParams.get("goal") ?? "";
  const [route, setRoute] = useState<RouteApiResult | null>(() =>
    readStoredRoute(),
  );
  const [selectedMode, setSelectedMode] = useState<RouteMode>(
    () => readStoredRoute()?.mode ?? "flat",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const routeTitle = useMemo(() => {
    if (!route) return "Your location -> Tujuan";
    return `${route.start} -> ${route.goal}`;
  }, [route]);

  const calculateRoute = useCallback(async (mode: RouteMode) => {
    if (!start || !goal) return;

    setSelectedMode(mode);
    setIsLoading(true);
    setError("");

    try {
      const result = await requestCampusRoute({ start, goal, mode });
      setRoute(result);
      window.sessionStorage.setItem(
        "itbypass:lastRoute",
        JSON.stringify(result),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Gagal menghitung rute dari backend",
      );
    } finally {
      setIsLoading(false);
    }
  }, [goal, start]);

  useEffect(() => {
    if (!start || !goal) return;
    if (route?.start === start && route.goal === goal) return;

    let cancelled = false;

    requestCampusRoute({ start, goal, mode: "flat" })
      .then((result) => {
        if (cancelled) return;
        setSelectedMode("flat");
        setRoute(result);
        window.sessionStorage.setItem(
          "itbypass:lastRoute",
          JSON.stringify(result),
        );
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Gagal menghitung rute dari backend",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [goal, route?.goal, route?.start, start]);

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 z-0 bg-zinc-300">
        <RouteResultMap path={route?.path ?? []} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-48 bg-gradient-to-b from-[#3b82f6]/35 via-white/15 to-transparent" />

      <header className="relative z-20 flex h-[96px] items-start justify-center px-5 pt-[max(2rem,env(safe-area-inset-top))]">
        <Link
          href="/search"
          aria-label="Back to search"
          className="absolute left-4 top-[max(1.85rem,env(safe-area-inset-top))] rounded-full p-2 text-white transition-colors hover:bg-white/10"
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.3"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] drop-shadow-md">
          ITBypass
        </h1>
      </header>

      <section className="relative z-20 mt-auto rounded-t-[28px] border border-white/18 bg-[linear-gradient(to_bottom,rgba(49,52,72,0.76),rgba(2,6,23,0.96)_48%,#020617_100%)] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-6 h-1 w-28 rounded-full bg-white/80" />

        <h2 className="truncate text-[21px] font-bold tracking-[-0.03em]">
          {routeTitle}
        </h2>

        <p className="mt-5 text-[12px] font-medium text-white/42">
          choose route
        </p>

        {error && (
          <p className="mt-3 rounded-lg border border-red-300/20 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-100">
            {error}
          </p>
        )}

        <div className="mt-1 divide-y divide-white/45 border-b border-white/45">
          {ROUTE_OPTIONS.map((option) => {
            const isSelected = selectedMode === option.mode;
            const minutes =
              route?.mode === option.mode ? route.minutes : undefined;

            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => calculateRoute(option.mode)}
                className={`relative flex w-full flex-col py-3 text-left transition-colors hover:bg-white/5 ${
                  isSelected ? "text-[#3b82f6]" : "text-white"
                }`}
              >
                {isSelected && (
                  <span className="absolute bottom-3 left-[-7px] top-3 w-[3px] rounded-full bg-[#3b82f6]" />
                )}
                <span className="text-[15px] font-semibold">
                  {option.title}{" "}
                  <span className="font-medium">({option.subtitle})</span>
                </span>
                <span className="mt-1 text-[11px] font-bold text-white">
                  {isLoading && isSelected
                    ? "Menghitung..."
                    : `${minutes ?? route?.minutes ?? 5} menit`}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
