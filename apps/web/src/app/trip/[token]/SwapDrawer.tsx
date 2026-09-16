"use client";

import { useEffect, useState } from "react";
import { WARNING_COPY, type PublishedStop, type WarningCode } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { StopThumb } from "@/components/itinerary/StopThumb";

interface Alt {
  poi: { id: string; name: string; category: string; conciergeNote: string };
  score: number;
  driveDeltaSec: number;
}

export function SwapDrawer({
  token,
  itineraryId,
  dayIndex,
  stopIndex,
  stop,
  onClose,
  onSwapped,
}: {
  token: string;
  itineraryId: string;
  dayIndex: number;
  stopIndex: number;
  stop: PublishedStop;
  onClose: () => void;
  onSwapped: () => void;
}) {
  const [alts, setAlts] = useState<Alt[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    api<Alt[]>(
      `/trip/${token}/itinerary/${itineraryId}/alternates?dayIndex=${dayIndex}&stopIndex=${stopIndex}`,
    )
      .then((a) => {
        setAlts(a);
        setPicked(a[0]?.poi.id ?? null);
      })
      .catch(() => setAlts([]))
      .finally(() => setLoading(false));
  }, [dayIndex, stopIndex, itineraryId, token]);

  async function confirmSwap() {
    if (!picked) return;
    setSwapping(true);
    try {
      const res = await api<{ warnings: string[] }>(`/trip/${token}/itinerary/${itineraryId}/swap`, {
        method: "POST",
        body: JSON.stringify({ dayIndex, stopId: stop.id, newPoiId: picked }),
      });
      setWarnings(res.warnings ?? []);
      setTimeout(onSwapped, 500);
    } catch (e) {
      setWarnings([(e as Error).message]);
      setSwapping(false);
    }
  }

  const chosen = alts.find((a) => a.poi.id === picked);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[440px] flex-col rounded-t-lg bg-ivory pb-7 pt-3 shadow-sheet sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-3.5 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-linen" />
        </div>

        <div className="px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">
                Replacing · {stop.slot.replace(/_/g, " ")}, day {dayIndex + 1}
              </p>
              <h3 className="mt-1.5 font-display text-[25px] leading-tight">
                Instead of {stop.poiName}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-linen hover:bg-sand"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 4 L12 12 M12 4 L4 12" />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-graphite">
            Places that fit the same slot, the same drive window and the same evening.
          </p>
        </div>

        <ul className="mt-5 flex-1 space-y-2.5 overflow-y-auto px-6">
          {loading && <li className="text-sm text-muted">Finding good alternates…</li>}
          {!loading && alts.length === 0 && (
            <li className="text-sm text-muted">No good alternates in this category.</li>
          )}
          {alts.map((a) => (
            <li key={a.poi.id}>
              <button
                onClick={() => setPicked(a.poi.id)}
                className={
                  "flex w-full items-start gap-3.5 rounded-md p-3.5 text-left transition " +
                  (picked === a.poi.id
                    ? "border-[1.5px] border-brass bg-brass-wash"
                    : "border border-linen hover:border-brass/60")
                }
              >
                <StopThumb category={a.poi.category} name={a.poi.name} uid={a.poi.id} size={56} />
                <span className="min-w-0 grow">
                  <span className="flex items-baseline justify-between gap-2.5">
                    <span className="truncate text-[15.5px] font-medium">{a.poi.name}</span>
                    <span className="shrink-0 text-xs text-graphite">
                      {a.driveDeltaSec === 0
                        ? "same drive"
                        : `${a.driveDeltaSec > 0 ? "+" : ""}${Math.round(a.driveDeltaSec / 60)} min`}
                    </span>
                  </span>
                  {a.poi.conciergeNote && (
                    <span className="mt-1 block text-[13px] leading-snug text-graphite">
                      {a.poi.conciergeNote}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {warnings.length > 0 && (
          <div className="mx-6 mt-4 rounded-r-lg border-l-[3px] border-terracotta bg-brass-wash px-4 py-3">
            <p className="text-[13.5px] font-medium">Heads up</p>
            <ul className="mt-1 space-y-1 text-[13px] leading-snug text-graphite">
              {warnings.map((w) => (
                <li key={w}>{WARNING_COPY[w as WarningCode] ?? w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex gap-3 px-6">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Keep it
          </Button>
          <Button size="lg" className="grow" disabled={!picked || swapping} onClick={confirmSwap}>
            {swapping ? "Swapping…" : chosen ? `Swap to ${chosen.poi.name}` : "Swap"}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Updates your plan straight away · no review needed
        </p>
      </div>
    </div>
  );
}
