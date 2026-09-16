// Idempotent seed for the Goa MVP.
// Re-running will not create duplicate rows; existing rows are updated where safe.
import { eq } from "drizzle-orm";
import { db } from "../client";
import { destinations, villas, pois } from "../schema/index";
import { GOA_POIS } from "./goa.pois";
import { upsertGoaMap } from "./goa.map";

const DEST_SLUG = "goa";

async function upsertDestination() {
  const existing = await db.select().from(destinations).where(eq(destinations.slug, DEST_SLUG));
  if (existing[0]) return existing[0];
  const [row] = await db
    .insert(destinations)
    .values({
      name: "Goa",
      slug: DEST_SLUG,
      timezone: "Asia/Kolkata",
      bbox: { minLat: 14.85, minLng: 73.7, maxLat: 15.8, maxLng: 74.35 },
    })
    .returning();
  return row!;
}

async function upsertVillas(destinationId: string) {
  const seeds = [
    {
      destinationId,
      name: "Villa Amarante",
      slug: "villa-amarante",
      lat: 15.6291,
      lng: 73.7378,
      bedrooms: 5,
      description:
        "A five-bedroom villa set back from Ashwem, with a lap pool and a shaded courtyard for long lunches.",
      heroImageUrl: null,
    },
    {
      destinationId,
      name: "Villa Rio Sereno",
      slug: "villa-rio-sereno",
      lat: 15.6021,
      lng: 73.7415,
      bedrooms: 4,
      description:
        "Four bedrooms on the Chapora river bend, breakfast on the deck, and a boat you can borrow.",
      heroImageUrl: null,
    },
  ];
  for (const s of seeds) {
    const existing = await db.select().from(villas).where(eq(villas.slug, s.slug));
    if (existing[0]) {
      await db.update(villas).set(s).where(eq(villas.slug, s.slug));
    } else {
      await db.insert(villas).values(s);
    }
  }
}

async function upsertPois(destinationId: string) {
  for (const p of GOA_POIS) {
    const existing = await db
      .select()
      .from(pois)
      .where(eq(pois.name, p.name));
    const row = { destinationId, ...p };
    if (existing[0]) {
      await db.update(pois).set(row).where(eq(pois.id, existing[0].id));
    } else {
      await db.insert(pois).values(row);
    }
  }
}

export async function seedGoa(): Promise<void> {
  const dest = await upsertDestination();
  await upsertVillas(dest.id);
  await upsertPois(dest.id);
  await upsertGoaMap(dest.id);
  console.log(`  Goa destination: ${dest.id}`);
  console.log(`  Map asset: v2`);
  console.log(`  Villas: 2`);
  console.log(`  POIs: ${GOA_POIS.length}`);
}
