import { sql } from "drizzle-orm";
import { db } from "../../db/client";
import { poiDistances } from "../../db/schema/index";

export interface PairRow {
  fromId: string;
  fromKind: "poi" | "villa";
  toId: string;
  toKind: "poi" | "villa";
  meters: number;
  seconds: number;
}

export const distanceRepo = {
  bulkUpsert: async (rows: PairRow[]) => {
    if (rows.length === 0) return;
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      await db
        .insert(poiDistances)
        .values(chunk)
        .onConflictDoUpdate({
          target: [poiDistances.fromId, poiDistances.toId],
          set: {
            meters: sql`excluded.meters`,
            seconds: sql`excluded.seconds`,
            fromKind: sql`excluded.from_kind`,
            toKind: sql`excluded.to_kind`,
            updatedAt: new Date(),
          },
        });
    }
  },
  clearAll: () => db.delete(poiDistances).execute(),
};
