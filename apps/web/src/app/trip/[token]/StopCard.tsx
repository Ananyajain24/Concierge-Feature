"use client";

import { useState } from "react";
import type { PublishedStop } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { StopThumb } from "@/components/itinerary/StopThumb";
import { WarningBanner } from "@/components/itinerary/WarningBanner";
import { SwapDrawer } from "./SwapDrawer";

const CTA: Record<string, string> = {
  restaurant: "Reserve a table",
  cafe: "Reserve a table",
  bar: "Reserve a table",
  spa: "Book a treatment",
  watersport: "Book this",
  day_trip: "Book this",
};

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
  const driveKm = stop.driveFromPreviousMeters / 1000;

  async function bookClick(e: React.MouseEvent) {
    e.stopPropagation();
    const url = stop.bookingUrl ?? "https://lohono.com";
    // The click is the product: log the lead first, then hand off.
    await api("/trip/lead", {
      method: "POST",
      body: JSON.stringify({ itineraryId, stopId: stop.id, poiId: stop.poiId, url }),
    }).catch(() => null);
    window.open(url, "_blank", "noopener");
  }

  return (
    <>
      <li
        onClick={onFocus}
        className={
          "flex cursor-pointer gap-[18px] rounded-md border bg-ivory p-[18px] transition " +
          (active ? "border-brass shadow-card" : "border-linen hover:border-brass/60")
        }
      >
        <StopThumb category={stop.poiCategory} name={stop.poiName} uid={stop.id} />

        <div className="min-w-0 grow">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">
                {stop.slot.replace(/_/g, " ")} · {stop.poiCategory.replace(/_/g, " ")}
              </p>
              <h3 className="mt-1 truncate text-[17px] font-medium">{stop.poiName}</h3>
            </div>
            <span className="shrink-0 whitespace-nowrap rounded-full border border-linen px-3 py-1 text-xs text-graphite">
              {driveMin > 0 ? `${driveMin} min · ${driveKm.toFixed(1)} km` : "at the villa"}
            </span>
          </div>

          {(stop.copy || stop.conciergeNote) && (
            <p className="mt-2 max-w-[64ch] text-[14.5px] leading-relaxed text-graphite">
              {stop.copy || stop.conciergeNote}
            </p>
          )}

          <WarningBanner codes={stop.warnings} />

          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {stop.bookable && (
              <Button size="sm" onClick={bookClick}>
                {CTA[stop.poiCategory] ?? "Book this"}
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(true);
              }}
            >
              Swap this stop
            </Button>
          </div>
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
