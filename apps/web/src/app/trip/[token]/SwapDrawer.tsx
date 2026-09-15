"use client";

import { useEffect, useState } from "react";
import type { PublishedStop } from "@lohono/shared-types";
import { api } from "@/lib/api";

interface Alt {
  poi: {
    id: string;
    name: string;
    category: string;
    conciergeNote: string;
  };
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
  const [swapping, setSwapping] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    api<Alt[]>(
      `/trip/${token}/itinerary/${itineraryId}/alternates?dayIndex=${dayIndex}&stopIndex=${stopIndex}`,
    )
      .then(setAlts)
      .finally(() => setLoading(false));
  }, [dayIndex, stopIndex, itineraryId, token]);

  async function swap(newPoiId: string) {
    setSwapping(newPoiId);
    try {
      const res = await api<{ warnings: string[] }>(
        `/trip/${token}/itinerary/${itineraryId}/swap`,
        {
          method: "POST",
          body: JSON.stringify({ dayIndex, stopId: stop.id, newPoiId }),
        },
      );
      setWarnings(res.warnings ?? []);
      setTimeout(() => onSwapped(), 400);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSwapping(null);
    }
  }

  async function remove() {
    if (!confirm("Remove this stop?")) return;
    setSwapping("remove");
    try {
      await api(`/trip/${token}/itinerary/${itineraryId}/remove`, {
        method: "POST",
        body: JSON.stringify({ dayIndex, stopId: stop.id }),
      });
      onSwapped();
    } finally {
      setSwapping(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40 sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-xl bg-white p-6 sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Swap this stop</p>
            <h3 className="font-display text-xl">{stop.poiName}</h3>
          </div>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">×</button>
        </div>

        {loading && <p className="text-sm text-ink/40">Finding good alternates…</p>}

        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {alts.map((a) => (
            <li key={a.poi.id} className="rounded border border-ink/10 p-3">
              <p className="text-sm font-medium">{a.poi.name}</p>
              <p className="text-xs text-ink/50">
                {a.poi.category} · Δ {Math.round(a.driveDeltaSec / 60)} min
              </p>
              {a.poi.conciergeNote && (
                <p className="mt-1 text-xs text-ink/70">{a.poi.conciergeNote}</p>
              )}
              <button
                onClick={() => swap(a.poi.id)}
                disabled={swapping !== null}
                className="mt-2 rounded bg-ink px-3 py-1 text-xs text-sand disabled:opacity-40"
              >
                {swapping === a.poi.id ? "Swapping…" : "Swap in"}
              </button>
            </li>
          ))}
          {!loading && alts.length === 0 && (
            <li className="text-sm text-ink/40">No good alternates in this category.</li>
          )}
        </ul>

        {warnings.length > 0 && (
          <div className="mt-4 rounded bg-yellow-50 p-3 text-xs text-yellow-900">
            <p className="mb-1 font-medium">Heads up:</p>
            <ul className="list-disc pl-4">
              {warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-between border-t border-ink/10 pt-4">
          <button
            onClick={remove}
            disabled={swapping !== null}
            className="text-sm text-coral"
          >
            Remove this stop
          </button>
          <button onClick={onClose} className="text-sm text-ink/50">
            Keep as is
          </button>
        </div>
      </div>
    </div>
  );
}
