import type { Violation } from "@lohono/itinerary-engine";
import { jsonCall } from "./llm.js";
import { llmSelectionSchema, type LlmSelection } from "@lohono/shared-types";

// One feedback pass — the model gets its previous JSON plus a violation report
// and returns a corrected structure. If it still fails, the caller flags for review.
export async function repairSelection(args: {
  previous: LlmSelection;
  violations: Violation[];
  candidateIds: string[];
}): Promise<{ data: LlmSelection; latencyMs: number; costUsd: number } | null> {
  const system =
    "You are correcting your previous itinerary output. Return ONLY JSON in the same shape. " +
    "All poiId values MUST come from the allowed list.";

  const user = [
    "Previous JSON:",
    JSON.stringify(args.previous, null, 2),
    "",
    "Validator violations to fix:",
    JSON.stringify(args.violations, null, 2),
    "",
    "Allowed poi ids:",
    JSON.stringify(args.candidateIds),
  ].join("\n");

  try {
    const res = await jsonCall<unknown>({ system, user });
    const parsed = llmSelectionSchema.safeParse(res.data);
    if (!parsed.success) return null;
    return { data: parsed.data, latencyMs: res.latencyMs, costUsd: res.costUsd };
  } catch {
    return null;
  }
}
