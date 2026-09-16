"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Poi } from "@lohono/shared-types";

const CATEGORIES = [
  "beach", "restaurant", "bar", "heritage", "market", "spa", "watersport", "cafe", "sunset_point", "day_trip",
];

export function CatalogTable({
  pois,
  initialQuery,
}: {
  pois: Poi[];
  initialQuery: Record<string, string>;
}) {
  const [q, setQ] = useState(initialQuery.q ?? "");
  const [category, setCategory] = useState(initialQuery.category ?? "");

  const filtered = useMemo(() => {
    return pois.filter((p) => {
      if (category && p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [pois, q, category]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="rounded border border-linen bg-ivory px-3 py-1.5 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-linen bg-ivory px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/catalog/new"
            className="rounded bg-ink px-3 py-1.5 text-sm text-ivory hover:opacity-90"
          >
            + New POI
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-linen bg-ivory">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Price</th>
              <th className="p-2">Bookable</th>
              <th className="p-2">Kid</th>
              <th className="p-2">Quality</th>
              <th className="p-2">Coords</th>
              <th className="p-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-linen">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2 text-graphite">{p.category}</td>
                <td className="p-2 text-graphite">{p.priceBand}</td>
                <td className="p-2">{p.bookable ? "✓" : "—"}</td>
                <td className="p-2">{p.kidFriendly ? "✓" : "—"}</td>
                <td className="p-2 text-graphite">{p.qualityScore.toFixed(2)}</td>
                <td className="p-2 text-xs text-muted">
                  {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                </td>
                <td className="p-2 text-right">
                  <Link href={`/admin/catalog/${p.id}`} className="text-brass-deep underline">
                    edit
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted">
                  No POIs. Run <code>pnpm db:seed</code>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
