import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/review", label: "Review queue" },
  { href: "/admin/catalog", label: "POI catalog" },
  { href: "/admin/maps/goa", label: "Map anchors" },
  { href: "/dev/map", label: "Map sandbox" },
  { href: "/admin/insights", label: "Insights" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      <aside className="hidden w-[216px] shrink-0 flex-col bg-forest p-4 pt-6 md:flex">
        <div className="px-1.5 pb-6">
          <p className="font-display text-[19px] uppercase tracking-[0.2em] text-ivory">Lohono</p>
          <p className="eyebrow mt-1 text-brass">Concierge desk</p>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-sm px-3 py-2.5 text-[13.5px] text-ivory/70 transition hover:bg-brass/20 hover:text-ivory"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-md bg-ivory/[0.07] p-3.5">
          <p className="eyebrow text-brass">The gate</p>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-ivory/75">
            Every edit you make is logged with a reason code. Those codes are what trains the next
            prompt version.
          </p>
        </div>
      </aside>

      <div className="min-w-0 grow">
        <header className="flex items-center gap-4 border-b border-linen px-6 py-4 md:hidden">
          <Link href="/admin/review" className="font-display text-xl">
            Lohono · Admin
          </Link>
        </header>
        <main className="px-6 py-8 md:px-9">{children}</main>
      </div>
    </div>
  );
}
