"use client";

import { useState } from "react";
import type { GuestBooking, LegKind } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { MessageSheet } from "@/components/itinerary/MessageSheet";
import { BookingConfirmation } from "@/components/itinerary/BookingConfirmation";

// The commission rail. Flights redirect to a real external search — Lohono
// never confirms a flight price, so there is no in-app booking for it, only
// a logged lead. Transfer and scooter are Lohono's own arrangement, so they
// book in-app for real and come back with a driver or rental contact.
export function TripRail({
  token,
  itineraryId,
  villaName,
  destinationName,
  checkIn,
  onBooked,
}: {
  token: string;
  itineraryId: string;
  villaName: string;
  destinationName: string;
  checkIn: string;
  onBooked: () => void;
}) {
  const [flightOpened, setFlightOpened] = useState(false);
  const [legBookings, setLegBookings] = useState<Partial<Record<LegKind, GuestBooking>>>({});
  const [pendingLeg, setPendingLeg] = useState<LegKind | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  function findFlights() {
    const url = `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights to ${destinationName} on ${checkIn}`)}`;
    window.open(url, "_blank", "noopener");
    // Still logged as a lead — the click is the product even though the
    // guest finishes the booking on the airline/OTA's own site.
    api("/trip/lead", {
      method: "POST",
      body: JSON.stringify({ itineraryId, stopId: "leg:flights", url }),
    }).catch(() => null);
    setFlightOpened(true);
  }

  async function bookLeg(leg: LegKind) {
    setPendingLeg(leg);
    try {
      const row = await api<GuestBooking>(`/trip/${token}/itinerary/${itineraryId}/book-leg`, {
        method: "POST",
        body: JSON.stringify({ leg }),
      });
      setLegBookings((prev) => ({ ...prev, [leg]: row }));
      onBooked();
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

        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm">Flights to {destinationName}</span>
            {flightOpened ? (
              <span className="text-[13px] text-sage-ink">Opened ✈</span>
            ) : (
              <button onClick={findFlights} className="text-[13px] font-medium text-brass-hover hover:text-ink">
                Find flights
              </button>
            )}
          </div>

          <div className="my-3 h-px bg-linen" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm">Airport transfer</span>
            {!legBookings.transfer && (
              <button
                onClick={() => bookLeg("transfer")}
                disabled={pendingLeg === "transfer"}
                className="text-[13px] font-medium text-brass-hover hover:text-ink disabled:opacity-50"
              >
                {pendingLeg === "transfer" ? "…" : "Arrange a car"}
              </button>
            )}
          </div>
          {legBookings.transfer && <BookingConfirmation booking={legBookings.transfer} />}

          <div className="my-3 h-px bg-linen" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm">Scooters for the trip</span>
            {!legBookings.scooter && (
              <button
                onClick={() => bookLeg("scooter")}
                disabled={pendingLeg === "scooter"}
                className="text-[13px] font-medium text-brass-hover hover:text-ink disabled:opacity-50"
              >
                {pendingLeg === "scooter" ? "…" : "Reserve"}
              </button>
            )}
          </div>
          {legBookings.scooter && <BookingConfirmation booking={legBookings.scooter} />}
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
