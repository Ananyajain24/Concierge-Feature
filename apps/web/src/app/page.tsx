import type { Destination, Villa } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { StartTripForm, type VillaOption } from "./StartTripForm";

export const dynamic = "force-dynamic";

// Guest-only page — no admin/dev links live here at all. The equivalent
// tools (review queue, catalog, map anchors, map sandbox) live at /admin,
// a separate dashboard nothing on this page ever links to.
interface Readiness {
  ready: boolean;
}

async function loadVillaOptions(): Promise<VillaOption[]> {
  const [villas, destinations] = await Promise.all([
    api<Villa[]>("/catalog/villas").catch(() => []),
    api<Destination[]>("/catalog/destinations").catch(() => []),
  ]);
  const destById = new Map(destinations.map((d) => [d.id, d]));
  const readiness = await Promise.all(
    destinations.map((d) => api<Readiness>(`/catalog/destinations/${d.id}/readiness`).catch(() => ({ ready: false }))),
  );
  const readyByDest = new Map(destinations.map((d, i) => [d.id, readiness[i]!.ready]));

  return villas
    .map((v) => ({
      id: v.id,
      name: v.name,
      destinationName: destById.get(v.destinationId)?.name ?? "Unknown",
      ready: readyByDest.get(v.destinationId) ?? false,
    }))
    .sort((a, b) => Number(b.ready) - Number(a.ready) || a.name.localeCompare(b.name));
}

export default async function HomePage() {
  const villas = await loadVillaOptions();

  return (
    <main className="flex min-h-screen flex-col justify-center bg-ivory px-6 py-16 md:px-12">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">Lohono</p>
        <h1 className="mt-3 font-display text-[44px] leading-[1.08] tracking-tight">
          Your trip, planned.
        </h1>
        <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-[1.72] text-graphite">
          Tell us about your stay, answer a few quick questions, and we&apos;ll build a day-by-day plan
          around your villa on the spot — with a map, real drive times, and every stop bookable right
          there.
        </p>
      </div>

      <div className="mx-auto mt-11 max-w-xl rounded-md border border-linen bg-sand p-6 text-left">
        <p className="eyebrow">Start planning</p>
        <p className="mt-2 mb-5 text-[13.5px] leading-relaxed text-graphite">
          Books the villa and takes you straight into the questionnaire.
        </p>
        {villas.length === 0 ? (
          <p className="text-[13.5px] text-terracotta">No villas in the catalog yet.</p>
        ) : (
          <StartTripForm villas={villas} />
        )}
      </div>
    </main>
  );
}
