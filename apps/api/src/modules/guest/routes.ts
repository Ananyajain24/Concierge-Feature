import type { FastifyInstance } from "fastify";
import { guestService } from "./service";
import { leadClickBody } from "./schema";

export async function registerGuest(app: FastifyInstance) {
  app.get("/trip/:token", async (req, reply) => {
    const token = (req.params as { token: string }).token;
    const trip = await guestService.trip(token);
    if (!trip) return reply.code(404).send({ error: "not found" });
    // Long-lived cache — bumped on publish (version in payload)
    reply.header(
      "Cache-Control",
      "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400",
    );
    return trip;
  });

  app.post("/trip/lead", async (req) => {
    const body = leadClickBody.parse(req.body);
    const row = await guestService.logLead({
      itineraryId: body.itineraryId,
      stopId: body.stopId,
      poiId: body.poiId ?? null,
      url: body.url,
    });
    // MVP: just log the click. Real integration is out of scope.
    console.log(`[LEAD] ${row.id} → ${body.url}`);
    return { ok: true, id: row.id };
  });
}
