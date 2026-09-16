import { api } from "@/lib/api";
import { InsightsCharts, type Insights } from "./InsightsCharts";

export const dynamic = "force-dynamic";

const EMPTY: Insights = {
  editRateOverTime: [],
  editRateByReason: [],
  poiSwapOutRate: [],
  ctaByPoi: [],
  generationByPromptVersion: [],
  slaCompliance: null,
};

export default async function InsightsPage() {
  const data = await api<Insights>("/insights").catch(() => EMPTY);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Insights</h1>
      <p className="text-sm text-graphite">
        Edit rate is the headline metric — it should trend down as prompts and catalog improve.
      </p>
      <InsightsCharts data={data} />
    </div>
  );
}
