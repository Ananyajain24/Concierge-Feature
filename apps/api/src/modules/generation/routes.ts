import type { FastifyInstance } from "fastify";
import { generateItineraryForBooking } from "./service.js";

// Manual trigger for testing; production path is the worker picking up jobs.
export async function registerGeneration(app: FastifyInstance) {
  app.post("/generate/:bookingId", async (req) => {
    const bookingId = (req.params as { bookingId: string }).bookingId;
    return generateItineraryForBooking(bookingId);
  });
}
