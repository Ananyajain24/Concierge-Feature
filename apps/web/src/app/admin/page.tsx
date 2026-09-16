import Link from "next/link";
import type { Destination, Poi, Villa } from "@lohono/shared-types";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

interface QueueItem {
  id: string;
}
interface GenRow {
  prompt_version: string;
  runs: number;
}
interface Insights {
  generationByPromptVersion: GenRow[];
}

const CARDS = [
  {
    href: "/admin/review",
    label: "Review queue",
    desc: "Anything still waiting on a reason-coded edit.",
  },
  {
    href: "/admin/catalog",
    label: "POI catalog",
    desc: "The curated places generation is allowed to pick from.",
  },
  {
    href: "/admin/maps/goa",
    label: "Map anchors",
    desc: "Fit lat/lng onto the illustrated artwork.",
  },
  {
    href: "/dev/map",
    label: "Map sandbox",
    desc: "The illustrated trip map, on fixtures.",
  },
  {
    href: "/admin/insights",
    label: "Insights",
    desc: "Reason-code trends, SLA compliance, lead clicks.",
  },
];

// Internal only — nothing on the guest-facing site (/) links here. There is
// no login gate (CLAUDE.md scopes auth out of the MVP), so this is "not
// discoverable," not "access controlled": anyone with the URL can still open
// it.
export default async function AdminDashboard() {
  const [queue, pois, villas, destinations, insights] = await Promise.all([
    api<QueueItem[]>("/review/queue").catch(() => []),
    api<Poi[]>("/catalog/pois").catch(() => []),
    api<Villa[]>("/catalog/villas").catch(() => []),
    api<Destination[]>("/catalog/destinations").catch(() => []),
    api<Insights>("/insights").catch((): Insights => ({ generationByPromptVersion: [] })),
  ]);

  const totalGenerated = insights.generationByPromptVersion.reduce((n, r) => n + Number(r.runs), 0);

  const stats = [
    { label: "Awaiting review", value: queue.length },
    { label: "Itineraries generated", value: totalGenerated },
    { label: "Villas", value: villas.length },
    { label: "Destinations", value: destinations.length },
    { label: "Catalog POIs", value: pois.length },
  ];

  return (
    <div>
      <h1 className="font-display text-[34px] tracking-tight">Dashboard</h1>
      <p className="mt-1.5 text-sm text-graphite">Internal tools — not linked from the guest site.</p>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-linen bg-ivory p-4">
            <p className="font-display text-[28px] leading-none">{s.value}</p>
            <p className="mt-1.5 text-[12px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col justify-between gap-4 rounded-md border border-linen bg-ivory p-5 transition hover:border-brass"
          >
            <div>
              <p className="text-[15px] font-medium text-ink">{c.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-brass">
              <path d="M3 8 H13 M9 4 L13 8 L9 12" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
