// The Goa map asset. Anchors are landmarks clicked onto the artwork in
// /admin/maps/goa; the affine fit over them is what turns lat/lng into x/y.
// Residuals against this set: 15px mean, 27px max on a 1000px canvas.
//
// Mirrored for the asset pipeline at apps/web/public/maps/goa/v2/transform.json.
import { and, eq } from "drizzle-orm";
import type { MapTransform } from "@lohono/shared-types";
import { db } from "../client";
import { mapAssets } from "../schema/index";

const VERSION = 2;

export const GOA_TRANSFORM: MapTransform = {
  kind: "affine",
  width: 1000,
  height: 620,
  matrix: [2450.3204, 260.6522, -184400.4284, -61.9241, -1718.6876, 31594.6468],
  anchors: [
    { id: "arambol", lat: 15.6869, lng: 73.7033, x: 302, y: 78, label: "Arambol" },
    { id: "ashwem", lat: 15.6432, lng: 73.7361, x: 328, y: 150, label: "Ashwem" },
    { id: "chapora", lat: 15.6055, lng: 73.735, x: 340, y: 200, label: "Chapora" },
    { id: "anjuna", lat: 15.5735, lng: 73.7407, x: 352, y: 246, label: "Anjuna" },
    { id: "assagao", lat: 15.585, lng: 73.77, x: 432, y: 246, label: "Assagao" },
    { id: "mapusa", lat: 15.5919, lng: 73.8087, x: 516, y: 216, label: "Mapusa" },
    { id: "candolim", lat: 15.518, lng: 73.762, x: 372, y: 356, label: "Candolim" },
    { id: "panjim", lat: 15.4989, lng: 73.8278, x: 556, y: 404, label: "Panjim" },
    { id: "oldgoa", lat: 15.5009, lng: 73.9119, x: 744, y: 372, label: "Old Goa" },
  ],
};

export async function upsertGoaMap(destinationId: string): Promise<void> {
  const row = {
    destinationId,
    version: VERSION,
    imageUrl: "/maps/goa/v2/artwork",
    transform: GOA_TRANSFORM,
  };
  const existing = await db
    .select()
    .from(mapAssets)
    .where(and(eq(mapAssets.destinationId, destinationId), eq(mapAssets.version, VERSION)));
  if (existing[0]) {
    await db.update(mapAssets).set(row).where(eq(mapAssets.id, existing[0].id));
  } else {
    await db.insert(mapAssets).values(row);
  }
}
