// The rest of Lohono's real destination list (lohono.com/villas), seeded so
// the booking flow is genuinely multi-destination rather than Goa-only.
//
// Deliberately NOT seeded here: POIs, a map asset, or distances. Inventing a
// "curated" catalog of places for six regions in one sitting would be exactly
// the thing rule 1 forbids the LLM from doing — a human has to actually
// curate a destination's places and an illustrator has to draw its map before
// it can plan a trip. Until then, catalogService.destinations.readiness()
// reports these as not ready, and the guest-facing offer screen reads that
// live instead of hardcoding a "only Goa works" check — seed Goa's siblings
// here and the app picks them up with no code change.
import { eq } from "drizzle-orm";
import { db } from "../client";
import { destinations, villas } from "../schema/index";

interface DestinationSeed {
  name: string;
  slug: string;
  timezone: string;
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number };
  villa: {
    name: string;
    slug: string;
    lat: number;
    lng: number;
    bedrooms: number;
    description: string;
  };
}

const SEEDS: DestinationSeed[] = [
  {
    name: "South Goa",
    slug: "south-goa",
    timezone: "Asia/Kolkata",
    bbox: { minLat: 14.9, minLng: 73.9, maxLat: 15.35, maxLng: 74.2 },
    villa: {
      name: "Villa Palmeira",
      slug: "villa-palmeira",
      lat: 15.1547,
      lng: 73.9862,
      bedrooms: 4,
      description: "A quiet Palolem-side villa with a private pool behind a screen of coconut palms.",
    },
  },
  {
    name: "Alibaug",
    slug: "alibaug",
    timezone: "Asia/Kolkata",
    bbox: { minLat: 18.55, minLng: 72.85, maxLat: 18.75, maxLng: 73.05 },
    villa: {
      name: "Villa Kinara",
      slug: "villa-kinara",
      lat: 18.6414,
      lng: 72.8722,
      bedrooms: 5,
      description: "A five-bedroom farmhouse-style villa near Kihim beach, built around a long lawn and pool.",
    },
  },
  {
    name: "Lonavala / Khandala",
    slug: "lonavala-khandala",
    timezone: "Asia/Kolkata",
    bbox: { minLat: 18.68, minLng: 73.35, maxLat: 18.78, maxLng: 73.45 },
    villa: {
      name: "Villa Sahyadri",
      slug: "villa-sahyadri",
      lat: 18.7537,
      lng: 73.4045,
      bedrooms: 4,
      description: "Ghat-facing villa above the valley mist, with a plunge pool cut into the hillside.",
    },
  },
  {
    name: "Mussoorie / Dehradun",
    slug: "mussoorie-dehradun",
    timezone: "Asia/Kolkata",
    bbox: { minLat: 30.35, minLng: 78.0, maxLat: 30.55, maxLng: 78.15 },
    villa: {
      name: "Villa Himavan",
      slug: "villa-himavan",
      lat: 30.4598,
      lng: 78.0664,
      bedrooms: 4,
      description: "A pine-ringed villa on the Mussoorie ridge with a fireplace and a view of the Doon valley.",
    },
  },
  {
    name: "Srinagar / Pahalgam",
    slug: "srinagar-pahalgam",
    timezone: "Asia/Kolkata",
    bbox: { minLat: 33.9, minLng: 74.7, maxLat: 34.15, maxLng: 75.35 },
    villa: {
      name: "Villa Chinar",
      slug: "villa-chinar",
      lat: 34.0837,
      lng: 74.7973,
      bedrooms: 5,
      description: "A lakeside villa on Dal Lake with a private shikara mooring and a chinar-shaded terrace.",
    },
  },
  {
    name: "Coonoor",
    slug: "coonoor",
    timezone: "Asia/Kolkata",
    bbox: { minLat: 11.3, minLng: 76.75, maxLat: 11.4, maxLng: 76.85 },
    villa: {
      name: "Villa Nilgiri",
      slug: "villa-nilgiri",
      lat: 11.3521,
      lng: 76.7951,
      bedrooms: 3,
      description: "A colonial-era bungalow among tea estates, with a fire-lit sitting room and a wraparound veranda.",
    },
  },
];

export async function seedOtherDestinations(): Promise<void> {
  for (const s of SEEDS) {
    let dest = await db.select().from(destinations).where(eq(destinations.slug, s.slug)).then((r) => r[0]);
    if (!dest) {
      [dest] = await db
        .insert(destinations)
        .values({ name: s.name, slug: s.slug, timezone: s.timezone, bbox: s.bbox })
        .returning();
    }
    if (!dest) continue;

    const existingVilla = await db.select().from(villas).where(eq(villas.slug, s.villa.slug)).then((r) => r[0]);
    const villaRow = { destinationId: dest.id, ...s.villa, heroImageUrl: null };
    if (existingVilla) {
      await db.update(villas).set(villaRow).where(eq(villas.slug, s.villa.slug));
    } else {
      await db.insert(villas).values(villaRow);
    }
  }
  console.log(`  Other destinations: ${SEEDS.length} (villa only — no catalog yet, so not itinerary-ready)`);
}
