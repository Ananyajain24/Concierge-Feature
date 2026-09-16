import Link from "next/link";
import type { BookingsSummary, PublishedSnapshot } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { formatInr } from "@/lib/currency";

export const dynamic = "force-dynamic";

interface Trip {
  snapshot: PublishedSnapshot;
  itineraryId: string;
  version: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  transfer: "Airport transfer",
  scooter: "Scooter rental",
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  spa: "Spa",
  watersport: "Watersport",
  day_trip: "Day trip",
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function BookingsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trip = await api<Trip>(`/trip/${token}`).catch(() => null);
  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-graphite">This itinerary link isn&apos;t ready yet.</p>
      </main>
    );
  }

  const summary = await api<BookingsSummary>(
    `/trip/${token}/itinerary/${trip.itineraryId}/bookings`,
  ).catch((): BookingsSummary => ({ bookings: [], totalInr: 0 }));

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-ivory px-6 py-10">
      <Link href={`/trip/${token}`} className="text-[13px] text-graphite hover:text-ink">
        ← Back to your trip
      </Link>

      <h1 className="mt-4 font-display text-[34px] tracking-tight">Your bookings</h1>
      <p className="mt-2 text-[14.5px] text-graphite">{trip.snapshot.villa.name}</p>

      <div className="mt-6 rounded-md border border-linen bg-sand p-5">
        <p className="eyebrow">Total spent so far</p>
        <p className="mt-1.5 font-display text-[36px] leading-none tracking-tight">
          {formatInr(summary.totalInr)}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          {summary.bookings.length} {summary.bookings.length === 1 ? "booking" : "bookings"} confirmed
        </p>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {summary.bookings.map((b) => (
          <li key={b.id} className="rounded-md border border-linen bg-ivory p-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="eyebrow">{CATEGORY_LABEL[b.category] ?? b.category.replace(/_/g, " ")}</p>
                <p className="mt-1 text-[15px] font-medium">{b.title}</p>
              </div>
              <p className="shrink-0 font-display text-[19px]">{formatInr(b.priceInr)}</p>
            </div>
            {b.details && Object.keys(b.details).filter((k) => k !== "providerId").length > 0 && (
              <dl className="mt-2 space-y-0.5 text-[12.5px] text-graphite">
                {Object.entries(b.details)
                  .filter(([k]) => k !== "providerId")
                  .map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="capitalize text-muted">{k.replace(/([A-Z])/g, " $1").trim()}:</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="mt-2 text-[12px] text-muted">Confirmed {fmtDateTime(b.createdAt)}</p>
          </li>
        ))}
        {summary.bookings.length === 0 && (
          <li className="rounded-md border border-dashed border-linen p-8 text-center text-muted">
            Nothing booked yet — book a stop, a transfer, or a scooter from your trip page.
          </li>
        )}
      </ul>
    </main>
  );
}
