import Link from "next/link";

const NAV = [
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/review", label: "Review queue" },
  { href: "/admin/maps/goa", label: "Map anchors" },
  { href: "/admin/insights", label: "Insights" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="border-b border-ink/10 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Link href="/admin/catalog" className="font-display text-xl">
            Lohono · Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-ink/70 hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
