import { api } from "@/lib/api";
import type { Destination } from "@lohono/shared-types";
import { PoiForm } from "../PoiForm";

export const dynamic = "force-dynamic";

export default async function NewPoiPage() {
  const destinations = await api<Destination[]>("/catalog/destinations").catch(() => []);
  const destinationId = destinations[0]?.id ?? "";
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">New POI</h1>
      <PoiForm mode="create" destinationId={destinationId} />
    </div>
  );
}
