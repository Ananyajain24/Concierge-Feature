export interface LlmJsonCallArgs {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}

export interface LlmJsonCallResult<T> {
  data: T;
  raw: string;
  model: string;
  latencyMs: number;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
}

// One implementation per LLM backend. `jsonCall` is the only entry point —
// every provider must return strict JSON parsed into T.
export interface LlmProvider {
  name: string;
  defaultModel: string;
  jsonCall<T>(args: LlmJsonCallArgs): Promise<LlmJsonCallResult<T>>;
}
