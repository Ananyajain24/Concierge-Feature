import Link from "next/link";
import type { Destination, Villa } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { StartTripForm, type VillaOption } from "./StartTripForm";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin/review", label: "Concierge desk", sub: "Review queue and the reason-code gate" },
  { href: "/dev/map", label: "Map sandbox", sub: "The illustrated trip map, on fixtures" },
  { href: "/admin/maps/goa", label: "Map anchors", sub: "Fit lat/lng onto the artwork" },
];

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
    <main className="min-h-screen bg-ivory px-6 py-14 md:px-12">
      <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-[1fr_400px]">
        <div>
          <p className="eyebrow">Lohono</p>
          <h1 className="mt-3 max-w-[14ch] font-display text-[44px] leading-[1.08] tracking-tight">
            Your trip, planned.
          </h1>
          <p className="mt-4 max-w-[50ch] text-[15px] leading-[1.72] text-graphite">
            Tell us about your stay, answer a few quick questions, and a concierge will put together a
            day-by-day plan around your villa — with a map, real drive times, and every stop bookable
            right there.
          </p>

          <div className="mt-10 flex flex-col gap-2.5">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between gap-4 rounded-md border border-linen bg-ivory px-5 py-4 transition hover:border-brass"
              >
                <span>
                  <span className="block text-[15px] font-medium text-ink">{l.label}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{l.sub}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brass">
                  <path d="M3 8 H13 M9 4 L13 8 L9 12" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-md border border-linen bg-sand p-6">
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
      </div>
    </main>
  );
}
