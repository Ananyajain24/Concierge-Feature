"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Poi, PoiCategory, PriceBand } from "@lohono/shared-types";
import { api } from "@/lib/api";

const CATEGORIES: PoiCategory[] = [
  "beach", "restaurant", "bar", "heritage", "market", "spa", "watersport", "cafe", "sunset_point", "day_trip",
];
const BANDS: PriceBand[] = ["$", "$$", "$$$", "$$$$"];

type Draft = Omit<Poi, "id"> & { id?: string };

function blankDraft(destinationId: string): Draft {
  return {
    destinationId,
    name: "",
    category: "beach",
    lat: 0,
    lng: 0,
    vibeTags: [],
    priceBand: "$$",
    avgDurationMin: 60,
    openingHours: {
      mon: { open: "09:00", close: "22:00", closed: false },
      tue: { open: "09:00", close: "22:00", closed: false },
      wed: { open: "09:00", close: "22:00", closed: false },
      thu: { open: "09:00", close: "22:00", closed: false },
      fri: { open: "09:00", close: "22:00", closed: false },
      sat: { open: "09:00", close: "22:00", closed: false },
      sun: { open: "09:00", close: "22:00", closed: false },
    },
    seasonality: { best_months: [], avoid_months: [] },
    kidFriendly: true,
    bookable: false,
    conciergeNote: "",
    qualityScore: 0.7,
  };
}

export function PoiForm({
  initial,
  destinationId,
  mode,
}: {
  initial?: Poi;
  destinationId: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial ?? blankDraft(destinationId));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const payload = { ...draft, destinationId };
      if (mode === "edit" && initial) {
        await api(`/catalog/pois/${initial.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api(`/catalog/pois`, { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/admin/catalog");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded border border-ink/10 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input value={draft.name} onChange={(e) => set("name", e.target.value)} className="input" />
        </Field>
        <Field label="Category">
          <select value={draft.category} onChange={(e) => set("category", e.target.value as PoiCategory)} className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Latitude">
          <input type="number" step="0.0001" value={draft.lat} onChange={(e) => set("lat", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Longitude">
          <input type="number" step="0.0001" value={draft.lng} onChange={(e) => set("lng", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Price band">
          <select value={draft.priceBand} onChange={(e) => set("priceBand", e.target.value as PriceBand)} className="input">
            {BANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Duration (min)">
          <input type="number" value={draft.avgDurationMin} onChange={(e) => set("avgDurationMin", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Vibe tags (comma-separated)">
          <input
            value={draft.vibeTags.join(", ")}
            onChange={(e) => set("vibeTags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className="input"
          />
        </Field>
        <Field label="Quality score (0–1)">
          <input type="number" step="0.05" min={0} max={1} value={draft.qualityScore} onChange={(e) => set("qualityScore", Number(e.target.value))} className="input" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.kidFriendly} onChange={(e) => set("kidFriendly", e.target.checked)} />
          Kid-friendly
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.bookable} onChange={(e) => set("bookable", e.target.checked)} />
          Bookable
        </label>
      </div>

      <Field label="Concierge note">
        <textarea
          rows={3}
          value={draft.conciergeNote}
          onChange={(e) => set("conciergeNote", e.target.value)}
          className="input"
        />
      </Field>

      {err && <p className="text-sm text-coral">{err}</p>}

      <div className="flex justify-end gap-3">
        <button onClick={() => router.back()} className="rounded border px-4 py-1.5 text-sm">Cancel</button>
        <button onClick={save} disabled={saving} className="rounded bg-ink px-4 py-1.5 text-sm text-sand disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 14px;
          background: #fff;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs uppercase tracking-wide text-ink/60">{label}</span>
      {children}
    </label>
  );
}
