"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TransitionName =
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "fade-cross";

type TransitionPhase = "idle" | "exiting" | "entering";

type NavigationEvent = CustomEvent<{ href: string }>;

const EXIT_DURATION_MS = 220;
const ENTER_DURATION_MS = 340;

function getTransitionName(previous: string, current: string): TransitionName {
  if (previous === "/splash" || current === "/splash") {
    return "fade-cross";
  }
  if (previous === "/home" && current === "/search") {
    return "slide-up";
  }
  if (previous === "/search" && current === "/home") {
    return "slide-down";
  }
  if (previous === "/search" && current === "/route") {
    return "slide-left";
  }
  if (previous === "/route" && current === "/search") {
    return "slide-right";
  }
  if (current === "/home") {
    return "slide-right";
  }

  return "slide-left";
}

function getInternalHref(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return null;

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (current === next) return null;

  return next;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [transitionName, setTransitionName] =
    useState<TransitionName>("fade-cross");
  const previousPathnameRef = useRef(pathname);
  const navigationTimerRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
      if (phaseTimerRef.current !== null) {
        window.clearTimeout(phaseTimerRef.current);
      }
    };

    const startNavigation = (href: string) => {
      clearTimers();

      const url = new URL(href, window.location.origin);
      setTransitionName(getTransitionName(pathname, url.pathname));
      setPhase("exiting");

      navigationTimerRef.current = window.setTimeout(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, EXIT_DURATION_MS);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = getInternalHref(anchor);
      if (!href) return;

      event.preventDefault();
      startNavigation(href);
    };

    const handleNavigationEvent = (event: Event) => {
      const navigationEvent = event as NavigationEvent;
      if (!navigationEvent.detail?.href) return;

      event.preventDefault();
      startNavigation(navigationEvent.detail.href);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("itbypass:navigate", handleNavigationEvent);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("itbypass:navigate", handleNavigationEvent);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (pathname === previousPathnameRef.current) return;

    setTransitionName(getTransitionName(previousPathnameRef.current, pathname));
    previousPathnameRef.current = pathname;
    setPhase("entering");

    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
    }

    phaseTimerRef.current = window.setTimeout(() => {
      setPhase("idle");
    }, ENTER_DURATION_MS);
  }, [pathname]);

  return (
    <div className="page-transition-container flex min-h-dvh flex-col overflow-hidden relative">
      <div
        className={`page-transition-layer ${
          phase === "idle"
            ? ""
            : `${transitionName}-${phase === "exiting" ? "exit" : "enter"}`
        }`}
      >
        {children}
      </div>
    </div>
  );
}
