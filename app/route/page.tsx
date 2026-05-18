import { Suspense } from "react";
import { RoutePageClient } from "@/app/route/route-page-client";

export default function RoutePage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh items-center justify-center bg-[#020617] text-sm font-semibold text-white/70">
          Loading route...
        </main>
      }
    >
      <RoutePageClient />
    </Suspense>
  );
}
