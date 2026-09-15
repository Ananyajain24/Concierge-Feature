import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "../../db/client";
import { jobs } from "../../db/schema/index";

export const jobsRepo = {
  enqueue: (kind: string, payload: Record<string, unknown>, runAt = new Date()) =>
    db
      .insert(jobs)
      .values({ kind, payload, status: "queued", attempts: 0, nextRunAt: runAt })
      .returning()
      .then((r) => r[0]!),

  claimNext: async () => {
    // Naïve claim — grab one queued job whose nextRunAt has passed and mark running.
    // A real production runner would use SELECT ... FOR UPDATE SKIP LOCKED.
    return db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(jobs)
        .where(and(eq(jobs.status, "queued"), lte(jobs.nextRunAt, new Date())))
        .orderBy(asc(jobs.nextRunAt))
        .limit(1);
      if (!row) return null;
      await tx.update(jobs).set({ status: "running" }).where(eq(jobs.id, row.id));
      return row;
    });
  },

  complete: (id: string) => db.update(jobs).set({ status: "completed" }).where(eq(jobs.id, id)),

  fail: (id: string, error: string, attempts: number, delayMs: number) =>
    db
      .update(jobs)
      .set({
        status: attempts >= 5 ? "dead" : "queued",
        attempts,
        lastError: error.slice(0, 4000),
        nextRunAt: new Date(Date.now() + delayMs),
      })
      .where(eq(jobs.id, id)),

  get: (id: string) => db.select().from(jobs).where(eq(jobs.id, id)).limit(1).then((r) => r[0] ?? null),
};
