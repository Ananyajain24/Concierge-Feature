const TONE: Record<string, string> = {
  published: "bg-sage-tint text-sage-ink border border-sage-edge",
  review: "bg-amber-tint text-brass-hover border border-amber-edge",
  draft: "bg-brass-wash text-crimson border border-crimson-edge",
};

const DOT: Record<string, string> = {
  published: "bg-sage",
  review: "bg-amber",
  draft: "bg-crimson",
};

export function StatusPill({ status }: { status: string }) {
  const tone = TONE[status] ?? "bg-linen text-graphite";
  const dot = DOT[status] ?? "bg-muted";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] capitalize ${tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
