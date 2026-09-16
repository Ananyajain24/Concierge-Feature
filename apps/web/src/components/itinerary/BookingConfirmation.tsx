import type { GuestBooking } from "@lohono/shared-types";
import { formatInr } from "@/lib/currency";

// The category-specific confirmation shown right after a "Book" click —
// restaurant/venue gets address + phone, a transfer gets driver details, a
// scooter gets the rental contact. Everything here comes from the booking
// row the server just wrote, never invented client-side.
export function BookingConfirmation({ booking }: { booking: GuestBooking }) {
  const d = booking.details ?? {};
  return (
    <div className="mt-3.5 rounded-md border border-sage-edge bg-sage-tint px-4 py-3.5">
      <div className="flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-sage-ink">
          <path d="M3 8.5 L6.5 12 L13 4.5" />
        </svg>
        <span className="text-[13.5px] font-medium text-sage-ink">
          Confirmed{booking.priceInr != null ? ` — ${formatInr(booking.priceInr)}` : ""}
        </span>
      </div>

      <dl className="mt-2.5 space-y-1 text-[13px] text-graphite">
        {d.driverName && (
          <>
            <Row label="Driver" value={d.driverName} />
            {d.vehicle && <Row label="Vehicle" value={d.vehicle} />}
            {d.driverPhone && <Row label="Phone" value={d.driverPhone} />}
          </>
        )}
        {d.contactName && (
          <>
            <Row label="Contact" value={d.contactName} />
            {d.contactPhone && <Row label="Phone" value={d.contactPhone} />}
            {d.pickupNote && <Row label="Note" value={d.pickupNote} />}
          </>
        )}
        {d.address && <Row label="Address" value={d.address} />}
        {d.phone && !d.driverPhone && !d.contactPhone && <Row label="Phone" value={d.phone} />}
        {d.note && <Row label="Note" value={d.note} />}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
