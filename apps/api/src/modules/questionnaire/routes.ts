import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { questionnaireAnswersSchema } from "@lohono/shared-types";
import { questionnaireService } from "./service";
import { bookingService } from "../bookings/service";

const noteBody = z.object({ message: z.string().min(1) });

export async function registerQuestionnaire(app: FastifyInstance) {
  app.get("/questionnaire/:token", async (req, reply) => {
    const token = (req.params as { token: string }).token;
    const booking = await bookingService.byToken(token);
    if (!booking) return reply.code(404).send({ error: "not found" });
    const [prefs, ctx] = await Promise.all([
      questionnaireService.get(booking.id),
      questionnaireService.context(booking.villaId),
    ]);
    return {
      booking,
      preferences: prefs,
      villa: ctx?.villa ?? null,
      destination: ctx?.destination ?? null,
      readiness: ctx?.readiness ?? null,
    };
  });

  app.post("/questionnaire/:token/note", async (req, reply) => {
    const token = (req.params as { token: string }).token;
    const booking = await bookingService.byToken(token);
    if (!booking) return reply.code(404).send({ error: "not found" });
    const body = noteBody.parse(req.body);
    return questionnaireService.note(booking.id, booking.guestName, body.message);
  });

  app.post("/questionnaire/:token", async (req, reply) => {
    const token = (req.params as { token: string }).token;
    const booking = await bookingService.byToken(token);
    if (!booking) return reply.code(404).send({ error: "not found" });
    const answers = questionnaireAnswersSchema.parse(req.body);
    return questionnaireService.submit(booking.id, answers);
  });
}
