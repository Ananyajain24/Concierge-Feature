import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/env";
import { registerHealth } from "./modules/health/routes";
import { registerCatalog } from "./modules/catalog/routes";
import { registerBookings } from "./modules/bookings/routes";
import { registerQuestionnaire } from "./modules/questionnaire/routes";
import { registerGeneration } from "./modules/generation/routes";
import { registerJobs } from "./modules/jobs/routes";
import { registerReview } from "./modules/review/routes";
import { registerGuest } from "./modules/guest/routes";
import { registerEditing } from "./modules/editing/routes";
import { registerInsights } from "./modules/insights/routes";

export async function buildServer(): Promise<FastifyInstance> {
  const env = loadEnv();
  const app = Fastify({
    logger: {
      transport: env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
  });

  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });

  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err);
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    reply.status(status).send({
      error: err.name ?? "Error",
      message: err.message,
    });
  });

  await registerHealth(app);
  await registerCatalog(app);
  await registerBookings(app);
  await registerQuestionnaire(app);
  await registerGeneration(app);
  await registerJobs(app);
  await registerReview(app);
  await registerGuest(app);
  await registerEditing(app);
  await registerInsights(app);

  return app;
}
