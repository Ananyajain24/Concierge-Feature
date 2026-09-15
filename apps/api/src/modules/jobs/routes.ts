import type { FastifyInstance } from "fastify";
import { jobsService } from "./service.js";

export async function registerJobs(app: FastifyInstance) {
  app.get("/jobs/:id", async (req) => jobsService.get((req.params as { id: string }).id));
}
