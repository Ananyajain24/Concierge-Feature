import { z } from "zod";
import * as dotenv from "dotenv";

// Load .env file into process.env
dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  API_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  // Where the guest-facing app is served — used only to log the trip link
  // on publish (no WhatsApp/email sending in MVP, per CLAUDE.md).
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  // Which LLM backs generation — the only switch callers need to flip.
  LLM_PROVIDER: z.enum(["anthropic", "gemini"]).default("anthropic"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
  TOKEN_SECRET: z.string().min(8).default("dev-secret-change-me"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = parsed.data;
  warnIfProviderKeyMissing(cached);
  return cached;
}

// Non-fatal — the server should still boot without a key; only generation
// calls need it. Catches the common "set LLM_PROVIDER, forgot the key" typo.
function warnIfProviderKeyMissing(env: Env) {
  if (env.LLM_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) {
    console.warn("⚠ LLM_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set — generation calls will fail.");
  }
  if (env.LLM_PROVIDER === "gemini" && !env.GEMINI_API_KEY) {
    console.warn("⚠ LLM_PROVIDER=gemini but GEMINI_API_KEY is not set — generation calls will fail.");
  }
}
