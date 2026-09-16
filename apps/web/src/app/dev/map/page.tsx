"use client";

import dynamic from "next/dynamic";
import type { MapAnchor } from "@lohono/shared-types";
import type { MapStop } from "@/components/map/types";
import transform from "../../../../public/maps/goa/v2/transform.json";

const TripMap = dynamic(() => import("@/components/map/TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => <div className="aspect-[1000/620] rounded-lg bg-sea" />,
});

// One stop per drawn scene, so the sandbox doubles as the artwork's contact sheet.
const STOPS: MapStop[] = [
  { id: "d1", lat: 15.6432, lng: 73.7361, category: "beach", name: "Ashwem Beach", dayIndex: 0, order: 0, driveSec: 720, driveMeters: 5100 },
  { id: "d2", lat: 15.6055, lng: 73.735, category: "heritage", name: "Chapora Fort", dayIndex: 0, order: 1, driveSec: 1080, driveMeters: 7400 },
  { id: "d3", lat: 15.5919, lng: 73.8087, category: "market", name: "Mapusa Market", dayIndex: 1, order: 0, driveSec: 960, driveMeters: 6800 },
  { id: "d4", lat: 15.518, lng: 73.762, category: "restaurant", name: "Bomra's", dayIndex: 1, order: 1, driveSec: 1320, driveMeters: 9200 },
  { id: "d5", lat: 15.4989, lng: 73.8278, category: "watersport", name: "Mandovi sunset sail", dayIndex: 2, order: 0, driveSec: 1680, driveMeters: 14100 },
  { id: "d6", lat: 15.5009, lng: 73.9119, category: "heritage", name: "Basilica, Old Goa", dayIndex: 2, order: 1, driveSec: 2460, driveMeters: 21400 },
];

export default function DevMapPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-[34px]">Map sandbox</h1>
      <p className="mb-6 mt-2 text-sm text-graphite">
        {STOPS.length} stops, projected through the affine fit in transform.json.
      </p>
      <TripMap
        anchors={transform.anchors as MapAnchor[]}
        villa={{ id: "v", lat: 15.585, lng: 73.77, name: "Villa Amarante" }}
        stops={STOPS}
      />
    </main>
  );
}
