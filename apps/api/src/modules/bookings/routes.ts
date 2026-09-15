import type { FastifyInstance } from "fastify";
import { bookingService } from "./service";
import { bookingCreateBody } from "./schema";

export async function registerBookings(app: FastifyInstance) {
  app.get("/bookings", async () => bookingService.list());
  app.get("/bookings/:id", async (req) => bookingService.get((req.params as { id: string }).id));
  app.get("/bookings/by-token/:token", async (req) => {
    const token = (req.params as { token: string }).token;
    const row = await bookingService.byToken(token);
    if (!row) return { error: "invalid token" };
    return row;
  });
  app.post("/bookings", async (req) => bookingService.create(bookingCreateBody.parse(req.body)));
}
