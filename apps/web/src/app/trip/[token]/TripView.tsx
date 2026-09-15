"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { MapAnchor, PublishedSnapshot } from "@lohono/shared-types";
import type { MapPin, MapRoute } from "@/components/map/types";
import { StopCard } from "./StopCard";

const MapCanvas = dynamic(
  () => import("@/components/map/MapCanvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => <div className="aspect-[4/3] rounded-lg bg-[#c8dcea]" />,
  },
);

interface Trip {
  snapshot: PublishedSnapshot;
  itineraryId: string;
  version: number;
}

export function TripView({ trip }: { trip: Trip }) {
  const s = trip.snapshot;
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const anchors = (s.mapAsset.transformJson as { anchors?: MapAnchor[] }).anchors ?? [];

  const villaPin: MapPin = useMemo(
    () => ({
      id: `villa-${s.villa.id}`,
      lat: s.villa.lat,
      lng: s.villa.lng,
      category: "villa",
      label: s.villa.name,
      isVilla: true,
    }),
    [s.villa],
  );

  const pins: MapPin[] = useMemo(
    () =>
      s.days.flatMap((d) =>
        d.stops.map((stop) => ({
          id: stop.id,
          lat: stop.poiLat,
          lng: stop.poiLng,
          category: stop.poiCategory,
          label: stop.poiName,
          dayIndex: d.dayIndex,
          order: stop.order,
        })),
      ),
    [s.days],
  );

  const routes: MapRoute[] = useMemo(() => {
    const out: MapRoute[] = [];
    for (const d of s.days) {
      const chain: MapPin[] = [
        villaPin,
        ...d.stops.map((stop) => ({
          id: stop.id,
          lat: stop.poiLat,
          lng: stop.poiLng,
          category: stop.poiCategory,
          label: stop.poiName,
          dayIndex: d.dayIndex,
          order: stop.order,
        })),
      ];
      for (let i = 0; i < chain.length - 1; i++) {
        const nextStop = i > 0 ? d.stops[i - 1] : d.stops[0];
        const seconds = i === 0 ? d.stops[0]?.driveFromPreviousSec ?? 0 : d.stops[i]?.driveFromPreviousSec ?? 0;
        out.push({
          id: `${d.dayIndex}-${i}`,
          dayIndex: d.dayIndex,
          from: chain[i]!,
          to: chain[i + 1]!,
          driveMin: Math.round(seconds / 60),
          driveKm: Math.round((seconds / 3600) * 35 * 10) / 10,
        });
      }
    }
    return out;
  }, [s.days, villaPin]);

  return (
    <main className="min-h-screen bg-sand">
      <link rel="preload" as="image" href={s.mapAsset.imageUrl} fetchPriority="high" />

      <header className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-forest">
          Lohono · {s.dates.checkIn} → {s.dates.checkOut}
        </p>
        <h1 className="mt-3 font-display text-4xl">{s.villa.name}</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink/70">{s.summary}</p>
      </header>

      <section className="mx-auto max-w-5xl px-4">
        <MapCanvas
          imageUrl={s.mapAsset.imageUrl}
          width={s.mapAsset.width}
          height={s.mapAsset.height}
          anchors={anchors}
          villa={villaPin}
          pins={pins}
          routes={routes}
          activePinId={activePinId}
          onPinClick={(p) => setActivePinId(p.id)}
        />
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        {s.days.map((d) => (
          <div key={d.dayIndex} className="mb-12" style={{ contentVisibility: "auto" }}>
            <p className="text-xs uppercase tracking-widest text-ink/50">Day {d.dayIndex + 1} · {d.date}</p>
            <h2 className="mt-1 font-display text-2xl">{d.theme}</h2>
            <ul className="mt-6 space-y-4">
              {d.stops.map((stop) => (
                <StopCard
                  key={stop.id}
                  itineraryId={trip.itineraryId}
                  stop={stop}
                  active={activePinId === stop.id}
                  onFocus={() => setActivePinId(stop.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/40">
        Curated by Lohono · version {trip.version}
      </footer>
    </main>
  );
}
