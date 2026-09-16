"use client";

import dynamic from "next/dynamic";
import type { Booking, Day, Itinerary, Poi, Villa, MapAnchor } from "@lohono/shared-types";
import type { MapStop } from "@/components/map/types";
import transform from "../../../../../public/maps/goa/v2/transform.json";

const TripMap = dynamic(() => import("@/components/map/TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => <div className="aspect-[1000/620] rounded-lg bg-sea" />,
});

interface Detail {
  itinerary: Itinerary;
  booking: Booking;
  villa: Villa;
  pois: Poi[];
}

// Live preview of the whole trip as the reviewer edits it.
export function ReviewMap({ detail, days }: { detail: Detail; days: Day[] }) {
  const poiById = new Map(detail.pois.map((p) => [p.id, p]));

  const stops: MapStop[] = days.flatMap((d) =>
    d.stops.flatMap((s, si) => {
      const p = poiById.get(s.poiId);
      if (!p) return [];
      return [
        {
          id: `${d.dayIndex}-${si}-${p.id}`,
          lat: p.lat,
          lng: p.lng,
          category: p.category,
          name: p.name,
          dayIndex: d.dayIndex,
          order: si,
          driveSec: s.driveFromPreviousSec,
          driveMeters: s.driveFromPreviousMeters,
        },
      ];
    }),
  );

  return (
    <TripMap
      anchors={transform.anchors as MapAnchor[]}
      villa={{
        id: detail.villa.id,
        lat: detail.villa.lat,
        lng: detail.villa.lng,
        name: detail.villa.name,
      }}
      stops={stops}
      showChrome={false}
    />
  );
}
