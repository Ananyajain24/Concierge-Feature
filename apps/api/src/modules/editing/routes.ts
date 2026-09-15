import type { FastifyInstance } from "fastify";
import { editingService } from "./service";
import { addBody, freeTextBody, moveBody, removeBody, swapBody } from "./schema";

// Guest-scoped editing endpoints — auth is via the booking token in the URL.
export async function registerEditing(app: FastifyInstance) {
  app.post("/trip/:token/itinerary/:id/swap", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = swapBody.parse(req.body);
    return editingService.swap(token, id, body.dayIndex, body.stopId, body.newPoiId);
  });

  app.post("/trip/:token/itinerary/:id/remove", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = removeBody.parse(req.body);
    return editingService.remove(token, id, body.dayIndex, body.stopId);
  });

  app.post("/trip/:token/itinerary/:id/add", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = addBody.parse(req.body);
    return editingService.add(token, id, body.dayIndex, body.poiId, body.slot);
  });

  app.post("/trip/:token/itinerary/:id/move", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = moveBody.parse(req.body);
    return editingService.move(token, id, body.stopId, body.fromDayIndex, body.toDayIndex, body.toOrder, body.slot);
  });

  app.post("/trip/:token/itinerary/:id/message", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = freeTextBody.parse(req.body);
    return editingService.freeText(token, id, body.message);
  });

  app.get("/trip/:token/itinerary/:id/alternates", async (req) => {
    const { id } = req.params as { token: string; id: string };
    const q = req.query as { dayIndex?: string; stopIndex?: string };
    // Reuse review service's alternate ranking.
    const mod = await import("../review/service.js");
    return mod.reviewService.alternatesForStop(id, Number(q.dayIndex ?? 0), Number(q.stopIndex ?? 0));
  });
}
