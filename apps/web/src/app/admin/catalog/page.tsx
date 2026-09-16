import { api } from "@/lib/api";
import type { Poi, Destination, Villa } from "@lohono/shared-types";
import { CatalogTable } from "./CatalogTable";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.category) q.set("category", sp.category);
  if (sp.q) q.set("q", sp.q);
  const [destinations, villas, pois] = await Promise.all([
    api<Destination[]>("/catalog/destinations").catch(() => []),
    api<Villa[]>("/catalog/villas").catch(() => []),
    api<Poi[]>(`/catalog/pois?${q.toString()}`).catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-2xl">Catalog</h1>
        <p className="text-sm text-graphite">
          {destinations.length} destinations · {villas.length} villas · {pois.length} POIs
        </p>
      </section>
      <CatalogTable pois={pois} initialQuery={sp} />
    </div>
  );
}
