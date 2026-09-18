import Link from "next/link";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/ui/StatusPill";
import { ReviewFilters } from "./ReviewFilters";

export const dynamic = "force-dynamic";

interface QueueItem {
  id: string;
  status: string;
  slaDueAt: string | null;
  version: number;
  costUsd: number;
  createdAt: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  villaName: string;
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function ago(iso: string): string {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default async function ReviewQueuePage() {
  const rows = await api<QueueItem[]>("/review/queue").catch(() => []);
  // Newest first — every itinerary a guest has been shown, not just ones
  // waiting on a human, since generation publishes on its own now.
  const queue = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] tracking-tight">Guest itineraries</h1>
          <p className="mt-1.5 text-sm text-graphite">
            {queue.length} {queue.length === 1 ? "itinerary" : "itineraries"} · open one to edit or remove a stop
          </p>
        </div>
        <ReviewFilters />
      </div>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="[&>th]:pb-3 [&>th]:text-left [&>th]:text-[11px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-eyebrow [&>th]:text-muted">
              <th className="w-[30%]">Guest &amp; villa</th>
              <th className="w-[18%]">Stay</th>
              <th className="w-[14%]">Generated</th>
              <th className="w-[16%]">Status</th>
              <th className="w-[12%]">Cost</th>
              <th className="w-[10%]" />
            </tr>
          </thead>
          <tbody>
            {queue.map((r) => (
              <tr key={r.id} className="border-t border-linen align-middle [&>td]:py-4">
                <td>
                  <p className="font-medium">{r.guestName}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">{r.villaName}</p>
                </td>
                <td className="text-graphite">
                  {fmt(r.checkIn)} – {fmt(r.checkOut)}
                </td>
                <td className="text-graphite">{ago(r.createdAt)}</td>
                <td>
                  <StatusPill status={r.status} />
                </td>
                <td className="text-[13px] text-graphite">
                  v{r.version}
                  <span className="block text-[12.5px] text-muted">${r.costUsd.toFixed(3)}</span>
                </td>
                <td className="text-right">
                  <Link
                    href={`/admin/review/${r.id}`}
                    className="inline-flex h-9 items-center rounded-full bg-brass-deep px-4 text-[13px] font-medium text-ivory hover:bg-brass-hover"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={6} className="border-t border-linen py-16 text-center text-muted">
                  No itineraries generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
