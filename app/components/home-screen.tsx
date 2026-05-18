"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { CAMPUS_LOCATIONS } from "@/app/data/campus-locations";

const HomeMapView = dynamic(
  () =>
    import("@/app/components/home-map-view").then((m) => m.HomeMapView),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-200 text-sm text-zinc-600">
        Loading map…
      </div>
    ),
  },
);

const HISTORY_ITEMS = [
  { locationName: "Gedung Kuliah Umum II", subtitle: "Hari ini, 09.00 WIB" },
  { locationName: "Labtek IB", subtitle: "Kemarin, 12.00 WIB" },
  { locationName: "Rektorat", subtitle: "4 hari lalu, 14.00 WIB" },
  { locationName: "KOICA", subtitle: "6 hari lalu, 14.00 WIB" },
].map((item) => ({
  title:
    CAMPUS_LOCATIONS.find((location) => location.name === item.locationName)
      ?.name ?? item.locationName,
  subtitle: item.subtitle,
}));

/** Tinggi sheet saat menempel ke bawah (handle + search saja). */
const COLLAPSED_PX = 158;

/** Panel: navy transparan untuk efek glass */
const SHEET_BACKGROUND =
  "linear-gradient(to top, rgb(2 6 23 / 0.8) 0%, rgb(15 23 42 / 0.6) 40%, rgb(23 37 84 / 0.4) 100%)";

function useExpandedMaxPx() {
  const [maxPx, setMaxPx] = useState(480);
  useLayoutEffect(() => {
    const update = () => {
      setMaxPx(Math.min(Math.round(window.innerHeight * 0.66), 560));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return maxPx;
}

export function HomeScreen() {
  const expandedMaxPx = useExpandedMaxPx();
  const [heightPx, setHeightPx] = useState(COLLAPSED_PX);
  const [isDragging, setIsDragging] = useState(false);

  const startPointerY = useRef(0);
  const startHeight = useRef(COLLAPSED_PX);
  const dragging = useRef(false);

  const clampHeight = useCallback(
    (h: number) =>
      Math.min(expandedMaxPx, Math.max(COLLAPSED_PX, Math.round(h))),
    [expandedMaxPx],
  );

  const snapToNearest = useCallback(
    (h: number) => {
      const mid = (COLLAPSED_PX + expandedMaxPx) / 2;
      return h >= mid ? expandedMaxPx : COLLAPSED_PX;
    },
    [expandedMaxPx],
  );

  const onPointerDownHandle = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    startPointerY.current = e.clientY;
    startHeight.current = heightPx;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMoveHandle = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const deltaUp = startPointerY.current - e.clientY;
    setHeightPx(clampHeight(startHeight.current + deltaUp));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setHeightPx((h) => snapToNearest(h));
  };

  const sheetTransition =
    !isDragging &&
    "transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 z-0 bg-zinc-800">
        <HomeMapView />
      </div>

      {/* Top half-circle blue gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 overflow-hidden">
        <div className="absolute -top-[100px] left-1/2 h-[210px] w-[90%] -translate-x-1/2 rounded-[100%] bg-[#3b82f6]/70 blur-[40px]" />
      </div>

      <header className="pointer-events-none relative z-20 flex w-full items-center justify-center px-6 pb-24 pt-[max(2rem,env(safe-area-inset-top))]">
        <button
          className="pointer-events-auto absolute left-4 p-2 text-white/90 transition-colors hover:text-white"
          aria-label="Go back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold tracking-wide text-white drop-shadow-md">
          ITBypass
        </h1>
      </header>

      <div className="pointer-events-none relative z-10 flex flex-1" aria-hidden />

      <div className="pointer-events-auto relative z-20 mt-auto w-full pb-0">
        <div
          style={{ height: heightPx, background: SHEET_BACKGROUND }}
          className={`home-sheet-glass flex flex-col overflow-hidden rounded-t-[1.75rem] shadow-2xl backdrop-blur-lg backdrop-saturate-150 ${sheetTransition}`}
        >
          <div
            className="flex shrink-0 cursor-grab touch-none select-none items-center justify-center py-2 active:cursor-grabbing"
            onPointerDown={onPointerDownHandle}
            onPointerMove={onPointerMoveHandle}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            role="slider"
            aria-valuenow={heightPx}
            aria-valuemin={COLLAPSED_PX}
            aria-valuemax={expandedMaxPx}
            aria-label="Resize destination panel"
          >
            <div className="h-1 w-12 rounded-full bg-white/85" />
          </div>

          <div className="shrink-0 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
            <Link
              href="/search"
              className="where-to-bar flex min-h-[3.25rem] items-center gap-3 rounded-full border border-white/10 bg-[#4068cd]/80 px-4 py-2.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-md transition-[background-color,transform] duration-200 hover:bg-[#4b73d7]/85 active:scale-[0.985] active:bg-[#3159ba]/90"
              aria-label="Open route search"
            >
              <span
                className="inline-flex h-5 w-5 shrink-0 rounded-full border-[3px] border-cyan-400 bg-transparent"
                aria-hidden
              />
              <span className="where-to-input min-w-0 flex-1 text-left text-base font-medium text-white/90">
                Where to ?
              </span>
            </Link>
          </div>

          <div className="sheet-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] hide-scrollbar">
            <h2 className="pb-1 pt-3 text-lg font-bold tracking-wide text-white/60">
              History
            </h2>
            <ul className="divide-y divide-white/20 pb-1">
              {HISTORY_ITEMS.map((item) => (
                <li key={item.title}>
                  <button
                    type="button"
                    className="w-full py-3.5 text-left transition-colors hover:bg-white/5 active:bg-white/10 flex flex-col justify-center"
                  >
                    <span className="text-[15px] font-bold text-white">{item.title}</span>
                    <span className="text-[12px] font-semibold mt-1 text-white/90">{item.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-center pb-4 pt-2 border-t border-white/20">
              <button className="text-[13px] font-medium text-white/40 hover:text-white/60 transition-colors">
                Lengkapnya..
              </button>
            </div>
          </div>

          <div className="shrink-0 flex justify-center pb-2 pt-1 pointer-events-none z-10 bg-transparent">
            <div className="h-1.5 w-28 rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
