"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, Day, Itinerary, Poi, ReasonCode, Villa } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { ReasonPicker } from "./ReasonPicker";
import { AlternatePanel } from "./AlternatePanel";
import { ReviewMap } from "./ReviewMap";

interface Detail {
  itinerary: Itinerary;
  booking: Booking;
  villa: Villa;
  pois: Poi[];
}

export function ReviewWorkspace({ detail }: { detail: Detail }) {
  const router = useRouter();
  const [days, setDays] = useState<Day[]>(detail.itinerary.days ?? []);
  const [pending, setPending] = useState<null | { nextDays: Day[] }>(null);
  const [selection, setSelection] = useState<{ dayIndex: number; stopIndex: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const poiById = useMemo(
    () => Object.fromEntries(detail.pois.map((p) => [p.id, p])),
    [detail.pois],
  );

  function stageEdit(nextDays: Day[]) {
    setPending({ nextDays });
  }

  async function commitEdit(reasonCode: ReasonCode) {
    if (!pending) return;
    setSaving(true);
    try {
      await api(`/review/${detail.itinerary.id}/edit`, {
        method: "POST",
        body: JSON.stringify({ reasonCode, days: pending.nextDays }),
      });
      setDays(pending.nextDays);
      setPending(null);
    } finally {
      setSaving(false);
    }
  }

  function swapStop(dayIndex: number, stopIndex: number, newPoiId: string) {
    const next = days.map((d, di) =>
      di !== dayIndex
        ? d
        : {
            ...d,
            stops: d.stops.map((s, si) => (si === stopIndex ? { ...s, poiId: newPoiId } : s)),
          },
    );
    stageEdit(next);
  }

  function removeStop(dayIndex: number, stopIndex: number) {
    const next = days.map((d, di) =>
      di !== dayIndex ? d : { ...d, stops: d.stops.filter((_, si) => si !== stopIndex) },
    );
    stageEdit(next);
  }

  async function publish() {
    setSaving(true);
    try {
      await api(`/review/${detail.itinerary.id}/publish`, { method: "POST" });
      router.push("/admin/review");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr_20rem]">
      {pending && (
        <ReasonPicker onPick={(code) => commitEdit(code)} onCancel={() => setPending(null)} />
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">{detail.booking.guestName}</h1>
            <p className="text-sm text-graphite">
              {detail.villa.name} · {detail.booking.checkIn} → {detail.booking.checkOut}
            </p>
          </div>
          <button
            onClick={publish}
            disabled={saving}
            className="rounded-full bg-ink px-5 py-2 text-sm text-ivory disabled:opacity-40"
          >
            {saving ? "…" : "Approve & publish"}
          </button>
        </div>

        <p className="rounded border-l-4 border-ink/40 bg-ivory p-3 text-sm italic">
          {detail.itinerary.summary || "(no summary)"}
        </p>

        {days.map((d, di) => (
          <div key={di} className="rounded border border-linen bg-ivory">
            <header className="flex items-baseline justify-between border-b border-linen px-4 py-2">
              <h3 className="font-medium">Day {d.dayIndex + 1} · {d.date}</h3>
              <p className="text-xs uppercase tracking-wide text-muted">{d.theme}</p>
            </header>
            <ul>
              {d.stops.map((s, si) => {
                const poi = poiById[s.poiId];
                const active = selection?.dayIndex === di && selection.stopIndex === si;
                return (
                  <li
                    key={s.id}
                    onClick={() => setSelection({ dayIndex: di, stopIndex: si })}
                    className={
                      "flex cursor-pointer items-start gap-3 border-b border-linen p-3 last:border-b-0 " +
                      (active ? "bg-ink/5" : "hover:bg-ink/[0.02]")
                    }
                  >
                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-ink text-center text-xs leading-6 text-ivory">
                      {si + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{poi?.name ?? "(unknown POI)"}</p>
                      <p className="text-xs text-muted">
                        {s.slot} · {poi?.category} · {Math.round(s.driveFromPreviousSec / 60)}min from prev
                      </p>
                      {s.copy && <p className="mt-1 text-sm text-graphite">{s.copy}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStop(di, si);
                      }}
                      className="text-xs text-terracotta"
                    >
                      remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <ReviewMap detail={detail} days={days} />
      </section>

      <aside>
        <AlternatePanel
          itineraryId={detail.itinerary.id}
          selection={selection}
          poisById={poiById}
          onSwap={(newId) =>
            selection && swapStop(selection.dayIndex, selection.stopIndex, newId)
          }
        />
      </aside>
    </div>
  );
}
