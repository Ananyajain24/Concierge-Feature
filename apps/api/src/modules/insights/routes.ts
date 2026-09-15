import type { FastifyInstance } from "fastify";
import { insightsService } from "./service.js";

export async function registerInsights(app: FastifyInstance) {
  app.get("/insights", async () => insightsService.overview());
}
