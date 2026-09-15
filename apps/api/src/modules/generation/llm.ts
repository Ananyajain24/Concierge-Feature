import { getLlmProvider } from "./providers/index.js";
import type { LlmJsonCallArgs, LlmJsonCallResult } from "./providers/types.js";

export type JsonCallResult<T> = LlmJsonCallResult<T>;

// Strict JSON call — one turn, no tools, model is asked to return JSON only.
// Which backend actually runs this is decided entirely by LLM_PROVIDER in .env;
// callers never need to know whether it's Anthropic or Gemini underneath.
export async function jsonCall<T>(args: LlmJsonCallArgs): Promise<JsonCallResult<T>> {
  const provider = getLlmProvider();
  return provider.jsonCall<T>(args);
}
