"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { BookingsSummary, MapAnchor, PublishedSnapshot } from "@lohono/shared-types";
import type { MapStop } from "@/components/map/types";
import { api } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { MessageSheet } from "@/components/itinerary/MessageSheet";
import { StopCard } from "./StopCard";
import { TripRail } from "./TripRail";

const TripMap = dynamic(() => import("@/components/map/TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => <div className="aspect-[1000/620] w-full rounded-lg bg-sea" />,
});

interface Trip {
  snapshot: PublishedSnapshot;
  itineraryId: string;
  version: number;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export function TripView({ trip }: { trip: Trip }) {
  const s = trip.snapshot;
  const router = useRouter();
  const token = String(useParams().token);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chefSheetOpen, setChefSheetOpen] = useState(false);
  const [chefSent, setChefSent] = useState(false);
  const [bookingsSummary, setBookingsSummary] = useState<BookingsSummary | null>(null);

  const refreshBookings = useCallback(() => {
    api<BookingsSummary>(`/trip/${token}/itinerary/${trip.itineraryId}/bookings`)
      .then(setBookingsSummary)
      .catch(() => null);
  }, [token, trip.itineraryId]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const anchors = (s.mapAsset.transformJson as { anchors?: MapAnchor[] }).anchors ?? [];
  const stopCount = s.days.reduce((n, d) => n + d.stops.length, 0);

  // One map for the whole trip: every stop, measured from the villa.
  const mapStops: MapStop[] = useMemo(
    () =>
      s.days.flatMap((d) =>
        d.stops.map((stop) => ({
          id: stop.id,
          lat: stop.poiLat,
          lng: stop.poiLng,
          category: stop.poiCategory,
          name: stop.poiName,
          dayIndex: d.dayIndex,
          order: stop.order,
          driveSec: stop.driveFromVillaSec ?? stop.driveFromPreviousSec,
          driveMeters: stop.driveFromVillaMeters ?? stop.driveFromPreviousMeters,
        })),
      ),
    [s.days],
  );

  function focusStop(id: string | null) {
    setSelectedId(id);
    if (id) document.getElementById(`stop-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-ivory">
      <header className="flex items-center justify-between border-b border-linen px-6 py-5 md:px-12">
        <div className="flex items-baseline gap-3.5">
          <span className="font-display text-[22px] uppercase tracking-[0.22em]">Lohono</span>
          <span className="hidden h-3.5 w-px bg-linen sm:inline-block" />
          <span className="eyebrow hidden text-brass sm:inline">Concierge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/trip/${token}/bookings`}
            className="inline-flex items-center gap-2 rounded-full bg-brass-deep px-3.5 py-1.5 text-xs font-medium text-ivory hover:bg-brass-hover"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5 H13 L12 13 H4 Z M5.5 5 V3.5 A2.5 2.5 0 0 1 10.5 3.5 V5" />
            </svg>
            {bookingsSummary && bookingsSummary.bookings.length > 0
              ? `${formatInr(bookingsSummary.totalInr)} · ${bookingsSummary.bookings.length} ${bookingsSummary.bookings.length === 1 ? "booking" : "bookings"}`
              : "View my bookings"}
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-linen px-3.5 py-1.5 text-xs text-graphite sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Published · v{trip.version}
          </span>
        </div>
      </header>

      <div className="grid gap-10 px-6 pb-9 pt-10 md:px-12 lg:grid-cols-[minmax(0,1fr)_336px] lg:gap-14 lg:pt-12">
        <div>
          <p className="eyebrow">
            {fmtDate(s.dates.checkIn)} – {fmtDate(s.dates.checkOut)} · {s.villa.name}
          </p>
          <h1 className="mt-3.5 max-w-[15ch] font-display text-[34px] leading-[1.09] tracking-tight md:text-[44px]">
            {s.days.length} days around {s.villa.name}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.72] text-graphite">
            {s.guestName} — {s.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[`${s.days.length} days`, `${stopCount} stops`, s.villa.name].map((t) => (
              <span key={t} className="rounded-full border border-linen px-4 py-1.5 text-[13px] text-graphite">
                {t}
              </span>
            ))}
          </div>
        </div>
        <TripRail
          token={token}
          itineraryId={trip.itineraryId}
          villaName={s.villa.name}
          destinationName={s.destinationName}
          checkIn={s.dates.checkIn}
          checkOut={s.dates.checkOut}
          onBooked={refreshBookings}
        />
      </div>

      <section className="px-6 pb-3 md:px-12">
        <TripMap
          anchors={anchors}
          villa={{ id: s.villa.id, lat: s.villa.lat, lng: s.villa.lng, name: s.villa.name }}
          stops={mapStops}
          selectedId={selectedId}
          onSelect={(stop) => focusStop(stop?.id ?? null)}
        />
      </section>

      <div className="grid gap-10 px-6 pb-14 pt-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_336px] lg:gap-14">
        <div className="flex flex-col gap-10">
          {s.days.map((d) => (
            <section key={d.dayIndex} style={{ contentVisibility: "auto", containIntrinsicSize: "0 640px" }}>
              <div className="flex items-baseline justify-between gap-4 border-b border-linen pb-3.5">
                <div className="flex flex-wrap items-baseline gap-4">
                  <span className="eyebrow">
                    Day {d.dayIndex + 1} · {fmtDay(d.date)}
                  </span>
                  <h2 className="font-display text-[27px] leading-tight">{d.theme}</h2>
                </div>
                <span className="shrink-0 text-[12.5px] text-muted">
                  {Math.round(d.stops.reduce((n, st) => n + st.driveFromPreviousSec, 0) / 60)} min driving
                </span>
              </div>
              <ul className="mt-5 flex flex-col gap-3.5">
                {d.stops.map((stop, si) => (
                  <div key={stop.id} id={`stop-${stop.id}`}>
                    <StopCard
                      itineraryId={trip.itineraryId}
                      token={token}
                      dayIndex={d.dayIndex}
                      stopIndex={si}
                      stop={stop}
                      active={selectedId === stop.id}
                      onFocus={() => setSelectedId(stop.id)}
                      onEdited={() => router.refresh()}
                      onBooked={refreshBookings}
                    />
                  </div>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="flex flex-col gap-3.5">
          <div className="rounded-md border border-linen bg-forest p-5 text-ivory">
            <p className="eyebrow text-brass">One of ours</p>
            <p className="mt-3 font-display text-[25px] leading-tight">Arrange an in-villa chef</p>
            <p className="mb-4 mt-2.5 text-sm leading-relaxed text-ivory/75">
              A private chef for a night at {s.villa.name} — tell us the occasion and any dietary notes
              and your concierge will put together the menu.
            </p>
            {chefSent ? (
              <p className="text-sm text-brass">Sent — noted for your trip.</p>
            ) : (
              <Button className="w-full bg-brass text-ink hover:bg-brass" onClick={() => setChefSheetOpen(true)}>
                Ask about it
              </Button>
            )}
          </div>
          <div className="rounded-md border border-linen bg-sand p-5">
            <p className="eyebrow">Why these places</p>
            <p className="mt-3 text-sm leading-[1.7] text-graphite">
              Every stop here is a real place from our own curated {s.destinationName} list — never
              invented, only ever picked from places our team has actually been to.
            </p>
          </div>
        </aside>
      </div>

      <div className="border-t border-linen px-6 py-10 text-center md:px-12">
        <p className="mb-4 text-[14.5px] text-graphite">
          Booked a table, a car, a scooter? Everything you&apos;ve confirmed, and what it comes to, lives in one place.
        </p>
        <Link
          href={`/trip/${token}/bookings`}
          className="inline-flex items-center justify-center rounded-full bg-brass-deep px-8 py-3 text-sm font-medium text-ivory hover:bg-brass-hover"
        >
          View my bookings
        </Link>
      </div>

      <footer className="border-t border-linen py-8 text-center text-xs text-muted">
        Curated by Lohono · version {trip.version}
      </footer>

      {chefSheetOpen && (
        <MessageSheet
          title="Arrange an in-villa chef"
          placeholder="Any occasion, dietary notes, or preferred evening…"
          onSend={async (message) => {
            await api(`/trip/${token}/itinerary/${trip.itineraryId}/message`, {
              method: "POST",
              body: JSON.stringify({ message: `In-villa chef enquiry: ${message}` }),
            });
            setChefSheetOpen(false);
            setChefSent(true);
          }}
          onClose={() => setChefSheetOpen(false)}
        />
      )}
    </main>
  );
}
