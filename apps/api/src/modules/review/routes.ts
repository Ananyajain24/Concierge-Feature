import type { FastifyInstance } from "fastify";
import { reviewService } from "./service";
import { editBody, regenerateBody } from "./schema";

export async function registerReview(app: FastifyInstance) {
  app.get("/review/queue", async () => reviewService.queue());
  app.get("/review/:id", async (req) => reviewService.detail((req.params as { id: string }).id));
  app.get("/review/:id/edits", async (req) => {
    const { id } = req.params as { id: string };
    return (await import("./repository.js")).reviewRepo.listEdits(id);
  });
  app.post("/review/:id/edit", async (req) => {
    const { id } = req.params as { id: string };
    const body = editBody.parse(req.body);
    return reviewService.edit({
      itineraryId: id,
      actor: "reviewer",
      reasonCode: body.reasonCode,
      note: body.note,
      days: body.days,
    });
  });
  app.post("/review/:id/publish", async (req) => reviewService.publish((req.params as { id: string }).id));
  app.post("/review/:id/regenerate", async (req) => {
    const { id } = req.params as { id: string };
    const body = regenerateBody.parse(req.body);
    return reviewService.regenerate(id, body.note);
  });
  app.get("/review/:id/alternates", async (req) => {
    const { id } = req.params as { id: string };
    const q = req.query as { dayIndex?: string; stopIndex?: string };
    const day = Number(q.dayIndex ?? 0);
    const stop = Number(q.stopIndex ?? 0);
    return reviewService.alternatesForStop(id, day, stop);
  });
}
