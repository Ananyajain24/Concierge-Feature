import Link from "next/link";

const LINKS = [
  { href: "/dev/map", label: "Map sandbox", sub: "The illustrated trip map, on fixtures" },
  { href: "/admin/review", label: "Concierge desk", sub: "Review queue and the reason-code gate" },
  { href: "/admin/maps/goa", label: "Map anchors", sub: "Fit lat/lng onto the artwork" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="eyebrow">Lohono</p>
      <h1 className="mt-3 font-display text-[44px] leading-[1.08] tracking-tight">Concierge</h1>
      <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.72] text-graphite">
        AI-drafted villa itineraries, read and fixed by a human before the guest sees them, with an
        illustrated map of everything within reach of the villa.
      </p>

      <div className="mt-10 flex flex-col gap-2.5">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between gap-4 rounded-md border border-linen bg-ivory px-5 py-4 transition hover:border-brass"
          >
            <span>
              <span className="block text-[15px] font-medium text-ink">{l.label}</span>
              <span className="mt-0.5 block text-[13px] text-muted">{l.sub}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brass">
              <path d="M3 8 H13 M9 4 L13 8 L9 12" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted">
        Guest links are tokenised: /questionnaire/&lt;token&gt; and /trip/&lt;token&gt;.
      </p>
    </main>
  );
}
