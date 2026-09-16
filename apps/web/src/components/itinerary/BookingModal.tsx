"use client";

import { useState } from "react";
import type { GuestBooking } from "@lohono/shared-types";
import { Button } from "@/components/ui/Button";
import { BookingConfirmation } from "./BookingConfirmation";
import { formatInr } from "@/lib/currency";

/**
 * The gate in front of every booking: a picture and the real details first,
 * then a choice — book it through Lohono right here, or go finish it on the
 * place's own site. Never books on open; only the explicit "Book through
 * Lohono" click calls the API.
 */
export function BookingModal({
  categoryLabel,
  title,
  picture,
  description,
  address,
  phone,
  priceInr,
  priceNote,
  externalUrl,
  externalLabel = "Visit their website",
  onConfirm,
  onLogExternal,
  onClose,
}: {
  categoryLabel: string;
  title: string;
  picture: React.ReactNode;
  description?: string;
  address?: string | null;
  phone?: string | null;
  priceInr?: number | null;
  priceNote?: string;
  externalUrl?: string;
  externalLabel?: string;
  onConfirm: () => Promise<GuestBooking>;
  onLogExternal?: () => void;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState<GuestBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function bookThroughLohono() {
    setSubmitting(true);
    setError(null);
    try {
      const row = await onConfirm();
      setConfirmed(row);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function visitWebsite() {
    if (externalUrl) window.open(externalUrl, "_blank", "noopener");
    onLogExternal?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-t-lg bg-ivory shadow-sheet sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-[168px] items-center justify-center bg-sea">
          <svg width="180" height="140" viewBox="-90 -100 180 110">
            {picture}
          </svg>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 hover:bg-ivory"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 4 L12 12 M12 4 L4 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="eyebrow">{categoryLabel}</p>
          <h3 className="mt-1.5 font-display text-[25px] leading-tight">{title}</h3>
          {description && <p className="mt-2.5 text-[14px] leading-relaxed text-graphite">{description}</p>}

          <dl className="mt-4 space-y-1.5 text-[13.5px] text-graphite">
            {address && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-muted">Address</dt>
                <dd>{address}</dd>
              </div>
            )}
            {phone && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-muted">Phone</dt>
                <dd>{phone}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-muted">Price</dt>
              <dd>{priceNote ?? formatInr(priceInr)}</dd>
            </div>
          </dl>

          {confirmed ? (
            <>
              <BookingConfirmation booking={confirmed} />
              <Button size="lg" className="mt-4 w-full" onClick={onClose}>
                Done
              </Button>
            </>
          ) : (
            <>
              {error && <p className="mt-3 text-[13px] text-terracotta">{error}</p>}
              <div className="mt-5 flex flex-col gap-2.5">
                <Button size="lg" onClick={bookThroughLohono} disabled={submitting}>
                  {submitting ? "Booking…" : "Book through Lohono"}
                </Button>
                {externalUrl && (
                  <Button size="lg" variant="secondary" onClick={visitWebsite}>
                    {externalLabel}
                  </Button>
                )}
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                {externalUrl
                  ? "Book it yourself on their site, or let your concierge confirm it here."
                  : "Confirmed instantly — Lohono's own arrangement."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
