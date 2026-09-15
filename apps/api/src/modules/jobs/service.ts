import { jobsRepo } from "./repository.js";

export const jobsService = {
  enqueue: (kind: string, payload: Record<string, unknown>) => jobsRepo.enqueue(kind, payload),
  get: (id: string) => jobsRepo.get(id),
};
