import { loadEnv } from "../../../config/env";
import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import type { LlmProvider } from "./types";

const PROVIDERS: Record<string, LlmProvider> = {
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

// The one place that reads LLM_PROVIDER. Add a new backend by writing a
// provider module and registering it here — nothing else changes.
export function getLlmProvider(): LlmProvider {
  const env = loadEnv();
  const provider = PROVIDERS[env.LLM_PROVIDER];
  if (!provider) throw new Error(`Unknown LLM_PROVIDER "${env.LLM_PROVIDER}"`);
  return provider;
}

export type { LlmJsonCallArgs, LlmJsonCallResult, LlmProvider } from "./types";
