import Anthropic from "@anthropic-ai/sdk";
import { loadEnv } from "../../../config/env";
import { parseJsonResponse } from "./json-utils";
import type { LlmJsonCallArgs, LlmJsonCallResult, LlmProvider } from "./types";

// Rough per-1k-token USD prices — exact model names first, then a tier
// heuristic so a new model string (e.g. a future claude-*) still prices sanely.
const PRICING: Record<string, { in: number; out: number }> = {
  "claude-opus-5": { in: 0.015, out: 0.075 },
  "claude-sonnet-5": { in: 0.003, out: 0.015 },
  "claude-haiku-4-5-20251001": { in: 0.001, out: 0.005 },
};
const DEFAULT_PRICE = { in: 0.003, out: 0.015 };

function priceFor(model: string) {
  if (PRICING[model]) return PRICING[model];
  if (model.includes("opus")) return { in: 0.015, out: 0.075 };
  if (model.includes("haiku")) return { in: 0.001, out: 0.005 };
  return DEFAULT_PRICE;
}

let cachedClient: Anthropic | null = null;

function client(): Anthropic {
  if (cachedClient) return cachedClient;
  const env = loadEnv();
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY missing — set it in .env to use LLM_PROVIDER=anthropic");
  }
  cachedClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return cachedClient;
}

export const anthropicProvider: LlmProvider = {
  name: "anthropic",
  defaultModel: "claude-sonnet-5",

  async jsonCall<T>(args: LlmJsonCallArgs): Promise<LlmJsonCallResult<T>> {
    const env = loadEnv();
    const model = args.model ?? env.ANTHROPIC_MODEL;
    const start = Date.now();

    const res = await client().messages.create({
      model,
      max_tokens: args.maxTokens ?? 4096,
      system: args.system,
      messages: [{ role: "user", content: args.user }],
    });

    const latencyMs = Date.now() - start;
    const first = res.content[0];
    const raw = first && first.type === "text" ? first.text : "";
    const data = parseJsonResponse<T>(raw);

    const price = priceFor(model);
    const costUsd =
      (res.usage.input_tokens / 1000) * price.in + (res.usage.output_tokens / 1000) * price.out;

    return {
      data,
      raw,
      model,
      latencyMs,
      costUsd,
      inputTokens: res.usage.input_tokens,
      outputTokens: res.usage.output_tokens,
    };
  },
};
