import Anthropic from "@anthropic-ai/sdk";
import { loadEnv } from "../../config/env.js";

// Rough per-1k-token USD prices — kept here so cost accounting has a single home.
const PRICING: Record<string, { in: number; out: number }> = {
  "claude-sonnet-5": { in: 0.003, out: 0.015 },
  "claude-opus-5": { in: 0.015, out: 0.075 },
  "claude-haiku-4-5-20251001": { in: 0.001, out: 0.005 },
};

let cachedClient: Anthropic | null = null;

function client(): Anthropic {
  if (cachedClient) return cachedClient;
  const env = loadEnv();
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY missing — set it in .env before running generation");
  }
  cachedClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return cachedClient;
}

export interface JsonCallResult<T> {
  data: T;
  raw: string;
  model: string;
  latencyMs: number;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
}

// Strict JSON call — one turn, no tools, model is asked to return JSON only.
// We handle mild wrapping (```json fences) defensively.
export async function jsonCall<T>(args: {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}): Promise<JsonCallResult<T>> {
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
  const cleaned = stripJsonFence(raw);
  const data = JSON.parse(cleaned) as T;

  const price = PRICING[model] ?? { in: 0.003, out: 0.015 };
  const costUsd = (res.usage.input_tokens / 1000) * price.in + (res.usage.output_tokens / 1000) * price.out;

  return {
    data,
    raw,
    model,
    latencyMs,
    costUsd,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}

function stripJsonFence(s: string): string {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  return t;
}
