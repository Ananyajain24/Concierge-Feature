import { insightsRepo } from "./repository.js";

// Drizzle's `execute` returns { rows, ... }; normalise to plain arrays.
const rows = <T = unknown>(r: unknown): T[] => (r as { rows?: T[] }).rows ?? [];

export const insightsService = {
  overview: async () => {
    const [editOverTime, byReason, swapOut, cta, gen, sla] = await Promise.all([
      insightsRepo.editRateOverTime(),
      insightsRepo.editRateByReason(),
      insightsRepo.poiSwapOutRate(),
      insightsRepo.ctaByPoi(),
      insightsRepo.generationByPromptVersion(),
      insightsRepo.slaCompliance(),
    ]);
    return {
      editRateOverTime: rows(editOverTime),
      editRateByReason: rows(byReason),
      poiSwapOutRate: rows(swapOut),
      ctaByPoi: rows(cta),
      generationByPromptVersion: rows(gen),
      slaCompliance: rows(sla)[0] ?? null,
    };
  },
};
