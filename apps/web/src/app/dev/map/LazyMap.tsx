"use client";

import dynamic from "next/dynamic";

export const LazyMap = dynamic(
  () => import("@/components/map/MapCanvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-lg bg-[#c8dcea] text-ink/50">
        Loading map…
      </div>
    ),
  },
);
