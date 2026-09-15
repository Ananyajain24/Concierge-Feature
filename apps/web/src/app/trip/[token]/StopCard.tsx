"use client";

import { useState } from "react";
import type { PublishedStop } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { SwapDrawer } from "./SwapDrawer";

export function StopCard({
  itineraryId,
  token,
  dayIndex,
  stopIndex,
  stop,
  active,
  onFocus,
  onEdited,
}: {
  itineraryId: string;
  token: string;
  dayIndex: number;
  stopIndex: number;
  stop: PublishedStop;
  active: boolean;
  onFocus: () => void;
  onEdited: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const driveMin = Math.round(stop.driveFromPreviousSec / 60);

  async function bookClick(e: React.MouseEvent) {
    e.stopPropagation();
    await api("/trip/lead", {
      method: "POST",
      body: JSON.stringify({
        itineraryId,
        stopId: stop.id,
        poiId: stop.poiId,
        url: stop.bookingUrl ?? "https://example.com",
      }),
    }).catch(() => null);
    window.open(stop.bookingUrl ?? "https://example.com", "_blank");
  }

  return (
    <>
      <li
        onClick={onFocus}
        className={
          "cursor-pointer rounded-lg border bg-white p-4 transition " +
          (active ? "border-ink shadow-sm" : "border-ink/10 hover:border-ink/30")
        }
      >
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">
              {stop.slot} · {stop.poiCategory}
            </p>
            <h3 className="mt-0.5 font-display text-lg">{stop.poiName}</h3>
          </div>
          <p className="whitespace-nowrap text-xs text-ink/50">
            {driveMin > 0 ? `${driveMin} min drive` : "at villa"}
          </p>
        </div>

        {stop.copy && <p className="mt-3 text-sm text-ink/80">{stop.copy}</p>}
        {!stop.copy && stop.conciergeNote && (
          <p className="mt-3 text-sm italic text-ink/70">{stop.conciergeNote}</p>
        )}

        {stop.warnings.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {stop.warnings.map((w) => (
              <li key={w} className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900">
                {w}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {stop.bookable && (
            <button
              onClick={bookClick}
              className="rounded-full bg-ink px-4 py-1.5 text-sand hover:opacity-90"
            >
              Book / enquire
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen(true);
            }}
            className="rounded-full border border-ink/30 px-4 py-1.5 text-ink hover:bg-ink/5"
          >
            Swap
          </button>
        </div>
      </li>

      {drawerOpen && (
        <SwapDrawer
          token={token}
          itineraryId={itineraryId}
          dayIndex={dayIndex}
          stopIndex={stopIndex}
          stop={stop}
          onClose={() => setDrawerOpen(false)}
          onSwapped={() => {
            setDrawerOpen(false);
            onEdited();
          }}
        />
      )}
    </>
  );
}
