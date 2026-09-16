import { Button } from "@/components/ui/Button";

// The commission rail. Every row is a lead: in the MVP the CTA is stubbed and
// the click is what gets logged (see modules/guest logLead).
const LEGS = [
  { label: "Flights to Goa", cta: "Find flights" },
  { label: "Airport transfer", cta: "Arrange a car" },
  { label: "Scooters for the week", cta: "Reserve" },
];

export function TripRail() {
  return (
    <aside className="flex flex-col gap-3.5">
      <div className="rounded-md border border-linen bg-sand p-5">
        <p className="eyebrow">Getting there</p>
        <div className="mt-3.5 flex flex-col gap-3">
          {LEGS.map((leg, i) => (
            <div key={leg.label}>
              {i > 0 && <div className="mb-3 h-px bg-linen" />}
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm">{leg.label}</span>
                <a href="#" className="text-[13px] font-medium">
                  {leg.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-linen p-5">
        <p className="eyebrow">Your concierge</p>
        <p className="mb-4 mt-3 text-sm leading-relaxed text-graphite">
          Want something changed? Swap any stop yourself, or tell us and we&apos;ll redo the day.
        </p>
        <Button className="w-full">Message your concierge</Button>
      </div>
    </aside>
  );
}
