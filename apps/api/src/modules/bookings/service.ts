import crypto from "node:crypto";
import { bookingRepo } from "./repository.js";
import { signBookingToken, verifyBookingToken } from "../../lib/token.js";
import type { BookingCreateBody } from "./schema.js";

export const bookingService = {
  create: async (input: BookingCreateBody) => {
    const id = crypto.randomUUID();
    const token = signBookingToken(id);
    const row = await bookingRepo.create({ id, token, ...input });
    return row;
  },
  byToken: async (token: string) => {
    // We verify the signature AND look up by token — belt and braces.
    if (!verifyBookingToken(token)) return null;
    return bookingRepo.byToken(token);
  },
  get: bookingRepo.get,
  list: bookingRepo.list,
};
