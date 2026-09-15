import { api } from "@/lib/api";
import type { Poi } from "@lohono/shared-types";
import { PoiForm } from "../PoiForm";

export const dynamic = "force-dynamic";

export default async function EditPoiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poi = await api<Poi>(`/catalog/pois/${id}`);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Edit — {poi.name}</h1>
      <PoiForm mode="edit" initial={poi} destinationId={poi.destinationId} />
    </div>
  );
}
