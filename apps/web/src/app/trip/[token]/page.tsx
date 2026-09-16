import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { PublishedSnapshot } from "@lohono/shared-types";
import { TripView } from "./TripView";

export const dynamic = "force-dynamic";

interface Trip {
  snapshot: PublishedSnapshot;
  itineraryId: string;
  version: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const trip = await api<Trip>(`/trip/${token}`).catch(() => null);
  if (!trip) return { title: "Trip" };
  return {
    title: `${trip.snapshot.guestName} · ${trip.snapshot.villa.name}`,
    description: trip.snapshot.summary,
    openGraph: {
      title: `${trip.snapshot.villa.name} · Your itinerary`,
      description: trip.snapshot.summary,
    },
  };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = await api<Trip>(`/trip/${token}`).catch(() => null);
  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-graphite">This itinerary link isn&apos;t ready yet.</p>
      </main>
    );
  }
  return <TripView trip={trip} />;
}
