import { jobsRepo } from "../modules/jobs/repository";
import { generateItineraryForBooking } from "../modules/generation/service";
import { slaMonitorTick } from "../modules/review/sla";

type Handler = (payload: Record<string, unknown>) => Promise<unknown>;

const HANDLERS: Record<string, Handler> = {
  generate_itinerary: async (p) => {
    const bookingId = String(p.bookingId);
    if (!bookingId) throw new Error("payload.bookingId required");
    return generateItineraryForBooking(bookingId);
  },
  sla_monitor: async () => {
    await slaMonitorTick(console.log);
    return { ok: true };
  },
};

const POLL_INTERVAL_MS = 2000;
const BACKOFF_BASE_MS = 30_000;

async function tick(log: (msg: string) => void) {
  const job = await jobsRepo.claimNext();
  if (!job) return;
  log(`▶ job ${job.id} (${job.kind}) attempt ${job.attempts + 1}`);
  const h = HANDLERS[job.kind];
  const attempts = job.attempts + 1;
  if (!h) {
    await jobsRepo.fail(job.id, `no handler for ${job.kind}`, attempts, BACKOFF_BASE_MS * 2 ** attempts);
    return;
  }
  try {
    await h(job.payload);
    await jobsRepo.complete(job.id);
    log(`✓ job ${job.id} complete`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const delay = BACKOFF_BASE_MS * 2 ** attempts;
    await jobsRepo.fail(job.id, message, attempts, delay);
    log(`✗ job ${job.id} failed: ${message}`);
  }
}

export async function runWorker(log: (msg: string) => void = console.log) {
  log(`Worker started (poll every ${POLL_INTERVAL_MS}ms)`);
  while (true) {
    try {
      await tick(log);
    } catch (e) {
      log(`worker tick error: ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}
