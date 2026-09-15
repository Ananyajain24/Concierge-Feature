// Populate poi_distances for every villa->POI and POI->POI pair in a destination.
// Symmetric and complete: (a,b) and (b,a) are both written.
import { eq } from "drizzle-orm";
import { db, pool } from "../src/db/client";
import { destinations, pois, villas } from "../src/db/schema/index";
import { distanceRepo, type PairRow } from "../src/modules/distances/repository";
import { HaversineDetourProvider, type DistanceProvider } from "../src/modules/distances/provider";

const providers: Record<string, () => DistanceProvider> = {
  "haversine-detour-v1": () => new HaversineDetourProvider(),
};

async function build(destinationSlug: string, providerName = "haversine-detour-v1") {
  const dest = await db.select().from(destinations).where(eq(destinations.slug, destinationSlug));
  if (!dest[0]) throw new Error(`destination ${destinationSlug} not found`);
  const destId = dest[0].id;

  const [poiRows, villaRows] = await Promise.all([
    db.select().from(pois).where(eq(pois.destinationId, destId)),
    db.select().from(villas).where(eq(villas.destinationId, destId)),
  ]);

  const provider = (providers[providerName] ?? providers["haversine-detour-v1"])!();
  console.log(`Provider: ${provider.name}`);
  console.log(`POIs: ${poiRows.length}  Villas: ${villaRows.length}`);

  const nodes = [
    ...villaRows.map((v) => ({ id: v.id, kind: "villa" as const, lat: v.lat, lng: v.lng })),
    ...poiRows.map((p) => ({ id: p.id, kind: "poi" as const, lat: p.lat, lng: p.lng })),
  ];

  const rows: PairRow[] = [];
  for (const a of nodes) {
    for (const b of nodes) {
      if (a.id === b.id) continue;
      const { meters, seconds } = await provider.compute(a, b);
      rows.push({
        fromId: a.id,
        fromKind: a.kind,
        toId: b.id,
        toKind: b.kind,
        meters,
        seconds,
      });
    }
  }

  console.log(`Writing ${rows.length} pair rows…`);
  await distanceRepo.bulkUpsert(rows);
  console.log("✓ distances written");
}

async function main() {
  const slug = process.argv[2] ?? "goa";
  await build(slug);
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
