import Link from "next/link";
import { api } from "@/lib/api";
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

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const _sp = await searchParams;
  const rows = await api<QueueItem[]>("/review/queue").catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-2xl">Review queue</h1>
          <p className="text-sm text-ink/60">{rows.length} awaiting review</p>
        </div>
        <ReviewFilters />
      </div>

      <ul className="space-y-3">
        {rows.map((r) => {
          const remaining = r.slaDueAt ? new Date(r.slaDueAt).getTime() - Date.now() : 0;
          const tone =
            remaining <= 0 ? "border-coral bg-coral/5" :
            remaining < 4 * 3600 * 1000 ? "border-yellow-400 bg-yellow-50" :
            "border-ink/10 bg-white";
          const hrs = Math.round(remaining / 3600 / 1000);
          return (
            <li key={r.id} className={`rounded border ${tone} p-4`}>
              <Link href={`/admin/review/${r.id}`} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{r.guestName}</p>
                  <p className="text-xs text-ink/60">
                    {r.villaName} · {r.checkIn} → {r.checkOut}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className={remaining <= 0 ? "font-semibold text-coral" : ""}>
                    {remaining <= 0 ? "SLA breached" : `${hrs}h remaining`}
                  </p>
                  <p className="text-ink/50">v{r.version} · ${r.costUsd.toFixed(3)}</p>
                </div>
              </Link>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="rounded border border-dashed p-8 text-center text-ink/40">
            Empty queue.
          </li>
        )}
      </ul>
    </div>
  );
}
