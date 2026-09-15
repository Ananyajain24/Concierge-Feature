"use client";

import dynamic from "next/dynamic";
import type { Booking, Day, Itinerary, Poi, Villa, MapAnchor } from "@lohono/shared-types";
import type { MapPin, MapRoute } from "@/components/map/types";
import transform from "../../../../../public/maps/goa/v1/transform.json";

const MapCanvas = dynamic(
  () => import("@/components/map/MapCanvas").then((m) => m.MapCanvas),
  { ssr: false, loading: () => <div className="h-96 rounded-lg bg-[#c8dcea]" /> },
);

interface Detail {
  itinerary: Itinerary;
  booking: Booking;
  villa: Villa;
  pois: Poi[];
}

// Live preview of the currently-edited days: pins + routes derived from state.
export function ReviewMap({ detail, days }: { detail: Detail; days: Day[] }) {
  const poiById = Object.fromEntries(detail.pois.map((p) => [p.id, p]));

  const pins: MapPin[] = days.flatMap((d) =>
    d.stops
      .map((s, si) => {
        const p = poiById[s.poiId];
        if (!p) return null;
        return {
          id: `${d.dayIndex}-${si}-${p.id}`,
          lat: p.lat,
          lng: p.lng,
          category: p.category,
          label: p.name,
          dayIndex: d.dayIndex,
          order: si,
        } as MapPin;
      })
      .filter(Boolean) as MapPin[],
  );

  const villa: MapPin = {
    id: detail.villa.id,
    lat: detail.villa.lat,
    lng: detail.villa.lng,
    category: "villa",
    label: detail.villa.name,
    isVilla: true,
  };

  const routes: MapRoute[] = [];
  for (const d of days) {
    const chain = [villa, ...d.stops.map((s, si) => {
      const p = poiById[s.poiId];
      return p
        ? {
            id: `${d.dayIndex}-${si}-${p.id}`,
            lat: p.lat,
            lng: p.lng,
            category: p.category,
            label: p.name,
            dayIndex: d.dayIndex,
            order: si,
          } as MapPin
        : null;
    }).filter(Boolean) as MapPin[]];
    for (let i = 0; i < chain.length - 1; i++) {
      routes.push({
        id: `${d.dayIndex}-${i}`,
        dayIndex: d.dayIndex,
        from: chain[i]!,
        to: chain[i + 1]!,
        driveMin: 0,
        driveKm: 0,
      });
    }
  }

  return (
    <MapCanvas
      imageUrl="/maps/goa/v1/artwork.svg"
      width={transform.width}
      height={transform.height}
      anchors={transform.anchors as MapAnchor[]}
      villa={villa}
      pins={pins}
      routes={routes}
    />
  );
}
