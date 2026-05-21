"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animationClass, setAnimationClass] = useState("slide-left-enter");
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      const prev = prevPathnameRef.current;
      const curr = pathname;

      // Tentukan tipe animasi berdasarkan halaman asal dan tujuan
      let anim = "slide-left";
      if (prev === "/splash" || curr === "/splash") {
        anim = "fade-cross";
      } else if (prev === "/home" && curr === "/search") {
        anim = "slide-up";
      } else if (prev === "/search" && curr === "/home") {
        anim = "slide-down";
      } else if (prev === "/search" && curr === "/route") {
        anim = "slide-left";
      } else if (prev === "/route" && curr === "/search") {
        anim = "slide-right";
      } else if (curr === "/home") {
        anim = "slide-right";
      }

      // Mainkan animasi exit terlebih dahulu
      setAnimationClass(`${anim}-exit`);

      // Tunggu animasi exit selesai sebelum mengganti konten & memicu animasi enter
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setAnimationClass(`${anim}-enter`);
        prevPathnameRef.current = pathname;
      }, 210); // Menyesuaikan dengan durasi animasi CSS (200-220ms)

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div className="page-transition-container flex min-h-dvh flex-col overflow-hidden relative">
      <div className={`flex flex-col flex-1 w-full h-full ${animationClass}`}>
        {displayChildren}
      </div>
    </div>
  );
}
