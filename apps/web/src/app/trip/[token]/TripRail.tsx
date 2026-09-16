"use client";

import { useState } from "react";
import type { GuestBooking, LegKind } from "@lohono/shared-types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { MessageSheet } from "@/components/itinerary/MessageSheet";
import { BookingConfirmation } from "@/components/itinerary/BookingConfirmation";
import { BookingModal } from "@/components/itinerary/BookingModal";
import { TransferScene, ScooterScene } from "@/components/map/places/legs";

const TRANSFER_FLAT_INR = 3200; // mirrors apps/api/src/modules/ledger/service.ts
const SCOOTER_PER_DAY_INR = 400;

// The commission rail. Flights redirect to a real external search — Lohono
// never confirms a flight price, so there is no in-app booking for it, only
// a logged lead. Transfer and scooter are Lohono's own arrangement: a picture
// + details popup first, then they book in-app for real and come back with a
// driver or rental contact.
export function TripRail({
  token,
  itineraryId,
  villaName,
  destinationName,
  checkIn,
  checkOut,
  onBooked,
}: {
  token: string;
  itineraryId: string;
  villaName: string;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  onBooked: () => void;
}) {
  const [flightOpened, setFlightOpened] = useState(false);
  const [legBookings, setLegBookings] = useState<Partial<Record<LegKind, GuestBooking>>>({});
  const [openModal, setOpenModal] = useState<LegKind | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const days = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000),
  );
  const scooterPrice = SCOOTER_PER_DAY_INR * days;

  function findFlights() {
    const url = `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights to ${destinationName} on ${checkIn}`)}`;
    window.open(url, "_blank", "noopener");
    api("/trip/lead", {
      method: "POST",
      body: JSON.stringify({ itineraryId, stopId: "leg:flights", url }),
    }).catch(() => null);
    setFlightOpened(true);
  }

  async function bookLeg(leg: LegKind) {
    const row = await api<GuestBooking>(`/trip/${token}/itinerary/${itineraryId}/book-leg`, {
      method: "POST",
      body: JSON.stringify({ leg }),
    });
    setLegBookings((prev) => ({ ...prev, [leg]: row }));
    onBooked();
    return row;
  }

  async function sendConciergeMessage(message: string) {
    // Logged for the record (and swap/remove/add already publish a new
    // version instantly) — no reviewer sits in front of this right now, so
    // the request is noted rather than pulling the guest's own plan down.
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
                onClick={() => setOpenModal("transfer")}
                className="text-[13px] font-medium text-brass-hover hover:text-ink"
              >
                Arrange a car
              </button>
            )}
          </div>
          {legBookings.transfer && <BookingConfirmation booking={legBookings.transfer} />}

          <div className="my-3 h-px bg-linen" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm">Scooters for the trip</span>
            {!legBookings.scooter && (
              <button
                onClick={() => setOpenModal("scooter")}
                className="text-[13px] font-medium text-brass-hover hover:text-ink"
              >
                Reserve
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
            Sent — noted for your trip. Swap anything yourself any time.
          </p>
        ) : (
          <>
            <p className="mb-4 mt-3 text-sm leading-relaxed text-graphite">
              Want something changed? Swap any stop yourself — or send a note and we&apos;ll take it from there.
            </p>
            <Button className="w-full" onClick={() => setSheetOpen(true)}>
              Message your concierge
            </Button>
          </>
        )}
      </div>

      {openModal === "transfer" && (
        <BookingModal
          categoryLabel="Airport transfer"
          title={`${villaName} ⇄ Airport`}
          picture={<TransferScene />}
          description="A private car both ways, timed to your flight — Lohono's own fleet, not a third-party dispatch."
          priceInr={TRANSFER_FLAT_INR}
          onConfirm={() => bookLeg("transfer")}
          onClose={() => setOpenModal(null)}
        />
      )}

      {openModal === "scooter" && (
        <BookingModal
          categoryLabel="Scooter rental"
          title={`Scooter for your stay (${days} ${days === 1 ? "day" : "days"})`}
          picture={<ScooterScene />}
          description="Delivered and collected at the villa — helmets included."
          priceInr={scooterPrice}
          priceNote={`₹${SCOOTER_PER_DAY_INR}/day × ${days} = ₹${scooterPrice.toLocaleString("en-IN")}`}
          onConfirm={() => bookLeg("scooter")}
          onClose={() => setOpenModal(null)}
        />
      )}

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
