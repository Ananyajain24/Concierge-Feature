"use client";

import { useEffect, useState } from "react";
import type { Poi } from "@lohono/shared-types";
import { api } from "@/lib/api";

interface Alt {
  poi: Poi;
  score: number;
  driveDeltaSec: number;
}

export function AlternatePanel({
  itineraryId,
  selection,
  poisById,
  onSwap,
}: {
  itineraryId: string;
  selection: { dayIndex: number; stopIndex: number } | null;
  poisById: Record<string, Poi>;
  onSwap: (newPoiId: string) => void;
}) {
  const [alts, setAlts] = useState<Alt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection) return;
    setLoading(true);
    api<Alt[]>(
      `/review/${itineraryId}/alternates?dayIndex=${selection.dayIndex}&stopIndex=${selection.stopIndex}`,
    )
      .then(setAlts)
      .finally(() => setLoading(false));
  }, [selection, itineraryId]);

  if (!selection) {
    return (
      <div className="rounded border border-dashed p-6 text-sm text-ink/40">
        Select a stop to see alternates.
      </div>
    );
  }

  return (
    <div className="rounded border border-ink/10 bg-white p-4">
      <h3 className="mb-3 font-medium">Alternates</h3>
      {loading && <p className="text-xs text-ink/40">Ranking…</p>}
      <ul className="space-y-2">
        {alts.map((a) => (
          <li key={a.poi.id} className="rounded border border-ink/5 p-2">
            <p className="text-sm font-medium">{a.poi.name}</p>
            <p className="text-xs text-ink/60">
              {a.poi.category} · Δ {Math.round(a.driveDeltaSec / 60)}m · score {a.score.toFixed(2)}
            </p>
            <button
              onClick={() => onSwap(a.poi.id)}
              className="mt-1 text-xs text-ocean underline"
            >
              swap in
            </button>
          </li>
        ))}
        {!loading && alts.length === 0 && (
          <li className="text-xs text-ink/40">No good alternates.</li>
        )}
      </ul>
    </div>
  );
}
