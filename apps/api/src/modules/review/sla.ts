import { and, eq, lte } from "drizzle-orm";
import { db } from "../../db/client.js";
import { itineraries } from "../../db/schema/index.js";

// Logs SLA breaches (T-0) and near-breaches (T-4h).
// A production build might page or Slack; MVP just writes to stdout.
export async function slaMonitorTick(log: (msg: string) => void) {
  const now = new Date();
  const soon = new Date(now.getTime() + 4 * 3600 * 1000);
  const rows = await db
    .select({ id: itineraries.id, slaDueAt: itineraries.slaDueAt })
    .from(itineraries)
    .where(and(eq(itineraries.status, "review"), lte(itineraries.slaDueAt, soon)));

  for (const r of rows) {
    const due = r.slaDueAt ? new Date(r.slaDueAt).getTime() : 0;
    if (due <= now.getTime()) {
      log(`[SLA] BREACH itinerary=${r.id} due=${r.slaDueAt}`);
    } else {
      log(`[SLA] WARN  itinerary=${r.id} due=${r.slaDueAt} (~4h remaining)`);
    }
  }
}
