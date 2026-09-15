// Defensive against mild wrapping (```json fences) some models still add
// even when asked for raw JSON.
export function stripJsonFence(s: string): string {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  return t;
}

export function parseJsonResponse<T>(raw: string): T {
  return JSON.parse(stripJsonFence(raw)) as T;
}
