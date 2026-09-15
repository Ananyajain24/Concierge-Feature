import { verifyBookingToken } from "../../lib/token.js";
import { guestRepo } from "./repository.js";

export const guestService = {
  trip: async (token: string) => {
    if (!verifyBookingToken(token)) return null;
    return guestRepo.publishedByToken(token);
  },
  logLead: guestRepo.logLead,
};
