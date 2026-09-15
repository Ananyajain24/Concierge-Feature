import { jobsRepo } from "./repository";

export const jobsService = {
  enqueue: (kind: string, payload: Record<string, unknown>) => jobsRepo.enqueue(kind, payload),
  get: (id: string) => jobsRepo.get(id),
};
