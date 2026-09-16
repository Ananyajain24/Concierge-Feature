// Burn-down colour for the review queue: green above 12h, amber 4–12h,
// crimson under 4h, ink once breached.
export function SlaPill({ dueAt }: { dueAt: string | null }) {
  if (!dueAt) return <span className="text-xs text-muted">—</span>;
  const ms = new Date(dueAt).getTime() - Date.now();
  const hours = ms / 3_600_000;
  const label =
    ms <= 0
      ? "Breached"
      : hours >= 1
        ? `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`
        : `${Math.max(1, Math.round(hours * 60))}m`;

  const tone =
    ms <= 0
      ? "bg-ink text-ivory"
      : hours < 4
        ? "bg-brass-wash text-crimson border border-crimson-edge"
        : hours < 12
          ? "bg-amber-tint text-brass-hover border border-amber-edge"
          : "bg-sage-tint text-sage-ink border border-sage-edge";

  const dot = ms <= 0 ? "bg-ivory" : hours < 4 ? "bg-crimson" : hours < 12 ? "bg-amber" : "bg-sage";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] ${tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
