import { verifyBookingToken } from "../../lib/token";
import { guestRepo } from "./repository";

export const guestService = {
  trip: async (token: string) => {
    if (!verifyBookingToken(token)) return null;
    return guestRepo.publishedByToken(token);
  },
  logLead: guestRepo.logLead,
};
