"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { MessageSheet } from "@/components/itinerary/MessageSheet";

interface Leg {
  id: "flights" | "transfer" | "scooters";
  label: string;
  cta: string;
}

// The commission rail. Every row is a lead: clicking logs a real
// booking_leads row (rule: stub the CTA, log the click — no real partner
// APIs in MVP) and the row's own copy confirms that back to the guest,
// rather than bouncing them to a fake external partner site.
export function TripRail({
  token,
  itineraryId,
  villaName,
  destinationName,
}: {
  token: string;
  itineraryId: string;
  villaName: string;
  destinationName: string;
}) {
  const legs: Leg[] = [
    { id: "flights", label: `Flights to ${destinationName}`, cta: "Find flights" },
    { id: "transfer", label: "Airport transfer", cta: "Arrange a car" },
    { id: "scooters", label: "Scooters for the week", cta: "Reserve" },
  ];

  const [loggedLegs, setLoggedLegs] = useState<Set<string>>(new Set());
  const [pendingLeg, setPendingLeg] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  async function logLeg(leg: Leg) {
    setPendingLeg(leg.id);
    try {
      await api("/trip/lead", {
        method: "POST",
        body: JSON.stringify({
          itineraryId,
          stopId: `leg:${leg.id}`,
          url: `lohono://concierge/${leg.id}`,
        }),
      });
      setLoggedLegs((prev) => new Set(prev).add(leg.id));
    } finally {
      setPendingLeg(null);
    }
  }

  async function sendConciergeMessage(message: string) {
    // This is specifically an edit request (not a general contact form), so
    // it puts the itinerary back into review — the guest sees the plan is
    // being redone rather than the version that no longer reflects the ask.
    await api(`/trip/${token}/itinerary/${itineraryId}/message`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    setSheetOpen(false);
    setMessageSent(true);
  }

  return (
    <aside className="flex flex-col gap-3.5">
      <div className="rounded-md border border-linen bg-sand p-5">
        <p className="eyebrow">Getting there</p>
        <div className="mt-3.5 flex flex-col gap-3">
          {legs.map((leg, i) => {
            const logged = loggedLegs.has(leg.id);
            return (
              <div key={leg.id}>
                {i > 0 && <div className="mb-3 h-px bg-linen" />}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm">{leg.label}</span>
                  {logged ? (
                    <span className="text-[13px] text-sage-ink">Noted ✓</span>
                  ) : (
                    <button
                      onClick={() => logLeg(leg)}
                      disabled={pendingLeg === leg.id}
                      className="text-[13px] font-medium text-brass-hover hover:text-ink disabled:opacity-50"
                    >
                      {pendingLeg === leg.id ? "…" : leg.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-linen p-5">
        <p className="eyebrow">Your concierge</p>
        {messageSent ? (
          <p className="mt-3 text-sm leading-relaxed text-graphite">
            Sent — your concierge is redoing this and it&apos;ll be back with you shortly.
          </p>
        ) : (
          <>
            <p className="mb-4 mt-3 text-sm leading-relaxed text-graphite">
              Want something changed? Swap any stop yourself, or tell us and we&apos;ll redo the day.
            </p>
            <Button className="w-full" onClick={() => setSheetOpen(true)}>
              Message your concierge
            </Button>
          </>
        )}
      </div>

      {sheetOpen && (
        <MessageSheet
          title="Message your concierge"
          placeholder={`Anything about your stay at ${villaName}…`}
          onSend={sendConciergeMessage}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </aside>
  );
}
