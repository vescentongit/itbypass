"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SPLASH_MS = 2200;

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace("/home");
    }, SPLASH_MS);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col bg-[#050814]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-1/4 h-[55%] w-[70%] rounded-full bg-[#1d4ed8]/35 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-1/4 h-[50%] w-[65%] rounded-full bg-[#2563eb]/30 blur-[90px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <h1 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl">
          ITBypass
        </h1>
        {/* <button
          type="button"
          onClick={() => router.replace("/home")}
          className="mt-10 text-sm font-medium text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
        >
          Skip
        </button> */}
      </main>
    </div>
  );
}
