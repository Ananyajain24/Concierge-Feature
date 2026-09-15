import { destinationRepo, poiRepo, villaRepo } from "./repository";
import type { ListPoisQuery } from "./schema";

// Thin passthrough for MVP — reserve for cross-entity logic later
// (e.g. cascade rules, cache invalidation).
export const catalogService = {
  destinations: destinationRepo,
  villas: villaRepo,
  pois: {
    ...poiRepo,
    list: (q: ListPoisQuery) => poiRepo.list(q),
  },
};
