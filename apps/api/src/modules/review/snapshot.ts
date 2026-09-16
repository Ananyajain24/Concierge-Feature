import { and, eq } from "drizzle-orm";
import type { Day, Poi, PublishedSnapshot } from "@lohono/shared-types";
import { db } from "../../db/client";
import { GOA_TRANSFORM } from "../../db/seed/goa.map";
import { bookings, villas, destinations, mapAssets, itineraries, pois, poiDistances } from "../../db/schema/index";

// Build a self-contained render payload from live rows. On publish this jsonb
// is what the guest endpoint returns — never a join.
export async function buildPublishedSnapshot(
  itineraryId: string,
  version: number,
  summary: string,
): Promise<PublishedSnapshot> {
  const it = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId)).limit(1).then((r) => r[0]);
  if (!it) throw new Error("itinerary not found");
  const booking = await db.select().from(bookings).where(eq(bookings.id, it.bookingId)).limit(1).then((r) => r[0]);
  if (!booking) throw new Error("booking not found");
  const villa = await db.select().from(villas).where(eq(villas.id, booking.villaId)).limit(1).then((r) => r[0]);
  if (!villa) throw new Error("villa not found");
  const destination = await db
    .select()
    .from(destinations)
    .where(eq(destinations.id, villa.destinationId))
    .limit(1)
    .then((r) => r[0]);
  const map = await db
    .select()
    .from(mapAssets)
    .where(eq(mapAssets.destinationId, villa.destinationId))
    .limit(1)
    .then((r) => r[0]);
  const destPois = await db.select().from(pois).where(eq(pois.destinationId, villa.destinationId));
  const poiById = new Map<string, Poi>(destPois.map((p) => [p.id, p as Poi]));

  // Villa -> POI drives, read once. Rule 4: distances are never computed at
  // request time — they are looked up here and frozen into the snapshot.
  const fromVilla = await db
    .select()
    .from(poiDistances)
    .where(eq(poiDistances.fromId, villa.id));
  const villaDrive = new Map(fromVilla.map((d) => [d.toId, { sec: d.seconds, m: d.meters }]));

  const days = (it.days ?? []) as Day[];
  const publishedDays = days.map((d) => ({
    dayIndex: d.dayIndex,
    date: d.date,
    theme: d.theme,
    stops: d.stops.map((s) => {
      const poi = poiById.get(s.poiId);
      const fv = villaDrive.get(s.poiId);
      return {
        ...s,
        driveFromVillaSec: fv?.sec ?? 0,
        driveFromVillaMeters: fv?.m ?? 0,
        poiName: poi?.name ?? "?",
        poiCategory: poi?.category ?? "unknown",
        poiLat: poi?.lat ?? 0,
        poiLng: poi?.lng ?? 0,
        bookable: poi?.bookable ?? false,
        bookingUrl: poi?.bookingUrl ?? null,
        photoUrl: poi?.photoUrl ?? null,
        conciergeNote: poi?.conciergeNote ?? "",
        durationMin: poi?.avgDurationMin ?? 60,
        address: poi?.address ?? null,
        phone: poi?.phone ?? null,
        priceInr: poi?.priceInr ?? null,
      };
    }),
  }));

  const snapshot: PublishedSnapshot = {
    version,
    villa: {
      id: villa.id,
      name: villa.name,
      lat: villa.lat,
      lng: villa.lng,
      heroImageUrl: villa.heroImageUrl ?? null,
    },
    destinationId: villa.destinationId,
    destinationName: destination?.name ?? "Your destination",
    mapAsset: map
      ? {
          imageUrl: map.imageUrl,
          transformJson: map.transform,
          width: map.transform.width,
          height: map.transform.height,
          version: map.version,
        }
      : {
          // MVP fallback: bake in the placeholder path.
          imageUrl: "/maps/goa/v1/artwork.svg",
          transformJson: { kind: "affine", matrix: [0,0,0,0,0,0], width: 2048, height: 1536, anchors: [] },
          width: 2048,
          height: 1536,
          version: 1,
        },
    dates: { checkIn: String(booking.checkIn), checkOut: String(booking.checkOut) },
    guestName: booking.guestName,
    summary,
    days: publishedDays,
    warnings: [],
  };
  return snapshot;
}
