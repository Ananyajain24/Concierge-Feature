"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from "recharts";

export interface Insights {
  editRateOverTime: { day: string; itinerary_count: number; avg_edits_per_itinerary: number }[];
  editRateByReason: { reason_code: string; n: number }[];
  poiSwapOutRate: { id: string; name: string; category: string; times_swapped_out: number }[];
  ctaByPoi: { id: string; name: string; clicks: number }[];
  generationByPromptVersion: { prompt_version: string; runs: number; avg_cost_usd: number; avg_latency_ms: number }[];
  slaCompliance: { on_time: number; total_published: number; avg_review_seconds: number } | null;
}

export function InsightsCharts({ data }: { data: Insights }) {
  const sla = data.slaCompliance;
  const onTimePct = sla && sla.total_published > 0 ? Math.round((sla.on_time / sla.total_published) * 100) : 0;
  const medianReviewMin = sla ? Math.round(sla.avg_review_seconds / 60) : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="SLA on-time" value={`${onTimePct}%`} sub={sla ? `${sla.on_time}/${sla.total_published}` : "—"} />
        <Kpi label="Avg review" value={`${medianReviewMin}m`} />
        <Kpi
          label="Total edits"
          value={String(data.editRateByReason.reduce((a, b) => a + b.n, 0))}
        />
      </div>

      <Panel title="Edit rate over time">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.editRateOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(0, 10)} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avg_edits_per_itinerary" stroke="#e07a5f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Edits by reason">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.editRateByReason}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="reason_code" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="n" fill="#3d5a4d" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="POIs swapped out most often">
        <ol className="divide-y divide-ink/5">
          {data.poiSwapOutRate.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-6 text-right text-muted">{i + 1}</span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="text-xs text-muted">{r.category}</span>
              <span className="w-10 text-right font-mono">{r.times_swapped_out}</span>
            </li>
          ))}
          {data.poiSwapOutRate.length === 0 && <li className="py-4 text-sm text-muted">No swap events yet.</li>}
        </ol>
      </Panel>

      <Panel title="Booking CTA clicks per POI">
        <ol className="divide-y divide-ink/5">
          {data.ctaByPoi.slice(0, 15).map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-6 text-right text-muted">{i + 1}</span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="w-10 text-right font-mono">{r.clicks}</span>
            </li>
          ))}
          {data.ctaByPoi.length === 0 && <li className="py-4 text-sm text-muted">No clicks yet.</li>}
        </ol>
      </Panel>

      <Panel title="Generation cost & latency by prompt version">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-graphite">
            <tr>
              <th className="py-2">Prompt version</th>
              <th className="py-2 text-right">Runs</th>
              <th className="py-2 text-right">Avg $</th>
              <th className="py-2 text-right">Avg ms</th>
            </tr>
          </thead>
          <tbody>
            {data.generationByPromptVersion.map((r) => (
              <tr key={r.prompt_version} className="border-t border-linen">
                <td className="py-2 font-mono text-xs">{r.prompt_version}</td>
                <td className="py-2 text-right">{r.runs}</td>
                <td className="py-2 text-right">${r.avg_cost_usd.toFixed(4)}</td>
                <td className="py-2 text-right">{Math.round(r.avg_latency_ms)}</td>
              </tr>
            ))}
            {data.generationByPromptVersion.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-muted">No runs yet.</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-linen bg-ivory p-4">
      <h2 className="mb-3 font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded border border-linen bg-ivory p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
