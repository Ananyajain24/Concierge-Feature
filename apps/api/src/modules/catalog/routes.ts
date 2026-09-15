import type { FastifyInstance } from "fastify";
import { catalogService } from "./service";
import {
  destinationCreateBody,
  destinationUpdateBody,
  listPoisQuery,
  poiCreateBody,
  poiUpdateBody,
  villaCreateBody,
  villaUpdateBody,
} from "./schema";

export async function registerCatalog(app: FastifyInstance) {
  // destinations
  app.get("/catalog/destinations", async () => catalogService.destinations.list());
  app.get("/catalog/destinations/:id", async (req) => {
    const id = (req.params as { id: string }).id;
    const row = await catalogService.destinations.get(id);
    if (!row) throw app.httpErrors?.notFound?.("destination not found") ?? new Error("not found");
    return row;
  });
  app.post("/catalog/destinations", async (req) => {
    const body = destinationCreateBody.parse(req.body);
    return catalogService.destinations.create(body);
  });
  app.patch("/catalog/destinations/:id", async (req) => {
    const id = (req.params as { id: string }).id;
    const body = destinationUpdateBody.parse(req.body);
    return catalogService.destinations.update(id, body);
  });

  // villas
  app.get("/catalog/villas", async (req) => {
    const q = req.query as { destinationId?: string };
    return catalogService.villas.list(q.destinationId);
  });
  app.get("/catalog/villas/:id", async (req) => catalogService.villas.get((req.params as { id: string }).id));
  app.post("/catalog/villas", async (req) => catalogService.villas.create(villaCreateBody.parse(req.body)));
  app.patch("/catalog/villas/:id", async (req) => {
    const id = (req.params as { id: string }).id;
    return catalogService.villas.update(id, villaUpdateBody.parse(req.body));
  });

  // pois
  app.get("/catalog/pois", async (req) => catalogService.pois.list(listPoisQuery.parse(req.query)));
  app.get("/catalog/pois/:id", async (req) => catalogService.pois.get((req.params as { id: string }).id));
  app.post("/catalog/pois", async (req) => catalogService.pois.create(poiCreateBody.parse(req.body)));
  app.patch("/catalog/pois/:id", async (req) => {
    const id = (req.params as { id: string }).id;
    return catalogService.pois.update(id, poiUpdateBody.parse(req.body));
  });
  app.delete("/catalog/pois/:id", async (req) => catalogService.pois.remove((req.params as { id: string }).id));
}
