import crypto from "node:crypto";
import { loadEnv } from "../config/env.js";

// Signed opaque booking tokens: base64url(bookingId).sig
// No JWT — one HMAC and it stays under 120 chars.
export function signBookingToken(bookingId: string): string {
  const env = loadEnv();
  const payload = Buffer.from(bookingId, "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", env.TOKEN_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
  return `${payload}.${sig}`;
}

export function verifyBookingToken(token: string): string | null {
  const env = loadEnv();
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac("sha256", env.TOKEN_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
  if (expected !== sig) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
