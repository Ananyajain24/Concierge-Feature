import type { FastifyInstance } from "fastify";
import { questionnaireAnswersSchema } from "@lohono/shared-types";
import { questionnaireService } from "./service";
import { bookingService } from "../bookings/service";

export async function registerQuestionnaire(app: FastifyInstance) {
  app.get("/questionnaire/:token", async (req, reply) => {
    const token = (req.params as { token: string }).token;
    const booking = await bookingService.byToken(token);
    if (!booking) return reply.code(404).send({ error: "not found" });
    const prefs = await questionnaireService.get(booking.id);
    return { booking, preferences: prefs };
  });

  app.post("/questionnaire/:token", async (req, reply) => {
    const token = (req.params as { token: string }).token;
    const booking = await bookingService.byToken(token);
    if (!booking) return reply.code(404).send({ error: "not found" });
    const answers = questionnaireAnswersSchema.parse(req.body);
    return questionnaireService.submit(booking.id, answers);
  });
}
