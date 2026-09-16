"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export interface VillaOption {
  id: string;
  name: string;
  destinationName: string;
  ready: boolean;
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// The actual front door: pick a real villa, real dates, and land straight in
// the questionnaire on a real signed token — no curl, no admin step, just
// clicking through the one site.
export function StartTripForm({ villas }: { villas: VillaOption[] }) {
  const router = useRouter();
  const [villaId, setVillaId] = useState(villas[0]?.id ?? "");
  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState(todayPlus(30));
  const [checkOut, setCheckOut] = useState(todayPlus(34));
  const [partySize, setPartySize] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!villaId || !guestName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const booking = await api<{ token: string }>("/bookings", {
        method: "POST",
        body: JSON.stringify({ villaId, guestName: guestName.trim(), checkIn, checkOut, partySize }),
      });
      router.push(`/questionnaire/${booking.token}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-graphite">Your name</span>
        <input
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="e.g. Priya Menon"
          className="w-full rounded-sm border border-linen bg-ivory px-3.5 py-2.5 text-[15px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-graphite">Villa</span>
        <select
          required
          value={villaId}
          onChange={(e) => setVillaId(e.target.value)}
          className="w-full rounded-sm border border-linen bg-ivory px-3.5 py-2.5 text-[15px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
        >
          {villas.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.destinationName}
              {v.ready ? "" : " (itinerary planning coming soon)"}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-graphite">Check-in</span>
          <input
            required
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-sm border border-linen bg-ivory px-3.5 py-2.5 text-[15px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-graphite">Check-out</span>
          <input
            required
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-sm border border-linen bg-ivory px-3.5 py-2.5 text-[15px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-graphite">Guests</span>
        <input
          required
          type="number"
          min={1}
          max={20}
          value={partySize}
          onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
          className="w-32 rounded-sm border border-linen bg-ivory px-3.5 py-2.5 text-[15px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
        />
      </label>

      {error && <p className="text-[13px] text-terracotta">{error}</p>}

      <Button size="lg" type="submit" disabled={submitting} className="mt-1 w-full">
        {submitting ? "Booking…" : "Book & start planning"}
      </Button>
    </form>
  );
}
