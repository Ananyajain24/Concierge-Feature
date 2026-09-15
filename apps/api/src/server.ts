import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/env.js";
import { registerHealth } from "./modules/health/routes.js";
import { registerCatalog } from "./modules/catalog/routes.js";
import { registerBookings } from "./modules/bookings/routes.js";
import { registerQuestionnaire } from "./modules/questionnaire/routes.js";
import { registerGeneration } from "./modules/generation/routes.js";
import { registerJobs } from "./modules/jobs/routes.js";
import { registerReview } from "./modules/review/routes.js";
import { registerGuest } from "./modules/guest/routes.js";

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

  return app;
}
