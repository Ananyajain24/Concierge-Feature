import { GoogleGenAI } from "@google/genai";
import { loadEnv } from "../../../config/env";
import { parseJsonResponse } from "./json-utils";
import type { LlmJsonCallArgs, LlmJsonCallResult, LlmProvider } from "./types";

// Rough per-1k-token USD prices — exact model names first, then a tier
// heuristic (by name substring) so a new Gemini release (e.g. "gemini-3.8-flash")
// still gets a sane cost estimate without a code change.
const PRICING: Record<string, { in: number; out: number }> = {
  "gemini-3.1-flash-lite": { in: 0.00005, out: 0.0002 },
  "gemini-3.5-flash-lite": { in: 0.00005, out: 0.0002 },
  "gemini-3.8-flash": { in: 0.0002, out: 0.0008 },
};
const DEFAULT_PRICE = { in: 0.0002, out: 0.0008 };

function priceFor(model: string) {
  if (PRICING[model]) return PRICING[model];
  if (model.includes("lite")) return { in: 0.00005, out: 0.0002 };
  if (model.includes("pro")) return { in: 0.00125, out: 0.005 };
  return DEFAULT_PRICE;
}

let cachedClient: GoogleGenAI | null = null;

function client(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  const env = loadEnv();
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing — set it in .env to use LLM_PROVIDER=gemini");
  }
  cachedClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return cachedClient;
}

export const geminiProvider: LlmProvider = {
  name: "gemini",
  defaultModel: "gemini-3.5-flash-lite",

  async jsonCall<T>(args: LlmJsonCallArgs): Promise<LlmJsonCallResult<T>> {
    const env = loadEnv();
    const model = args.model ?? env.GEMINI_MODEL;
    const start = Date.now();

    const res = await client().models.generateContent({
      model,
      contents: args.user,
      config: {
        systemInstruction: args.system,
        responseMimeType: "application/json",
        maxOutputTokens: args.maxTokens ?? 4096,
      },
    });

    const latencyMs = Date.now() - start;
    const raw = res.text ?? "";
    const data = parseJsonResponse<T>(raw);

    const inputTokens = res.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = res.usageMetadata?.candidatesTokenCount ?? 0;
    const price = priceFor(model);
    const costUsd = (inputTokens / 1000) * price.in + (outputTokens / 1000) * price.out;

    return { data, raw, model, latencyMs, costUsd, inputTokens, outputTokens };
  },
};
