import type { FastifyInstance } from "fastify";
import { ledgerService } from "./service";
import { bookLegBody, bookStopBody } from "./schema";

// Guest-scoped, same token-in-URL auth pattern as modules/editing.
export async function registerLedger(app: FastifyInstance) {
  app.get("/trip/:token/itinerary/:id/bookings", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    return ledgerService.summary(token, id);
  });

  app.post("/trip/:token/itinerary/:id/book", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = bookStopBody.parse(req.body);
    return ledgerService.bookStop(token, id, body.stopId);
  });

  app.post("/trip/:token/itinerary/:id/book-leg", async (req) => {
    const { token, id } = req.params as { token: string; id: string };
    const body = bookLegBody.parse(req.body);
    return ledgerService.bookLeg(token, id, body.leg);
  });
}
