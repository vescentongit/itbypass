"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import splashBg from "@/src/images/splashbg.png";

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
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col bg-black overflow-hidden">
      <div className="absolute inset-0 z-0 w-full max-w-md h-dvh select-none pointer-events-none overflow-hidden">
        <Image
          src={splashBg}
          alt="Splash Background"
          fill
          priority
          className="object-cover scale-[1.6] origin-center opacity-100"
        />
      </div>

      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-6">
        <h1 className="text-center text-[42px] font-bold tracking-[-0.03em] text-white select-none">
          ITBypass
        </h1>
      </main>
    </div>
  );
}
