"use client";

import type { ReasonCode } from "@lohono/shared-types";

export const REASON_CODES: { value: ReasonCode; label: string }[] = [
  { value: "WRONG_VIBE", label: "Wrong vibe" },
  { value: "TOO_FAR", label: "Too far" },
  { value: "CLOSED", label: "Closed" },
  { value: "TOO_TOURISTY", label: "Too touristy" },
  { value: "OVERPRICED", label: "Overpriced" },
  { value: "NOT_KID_FRIENDLY", label: "Not kid-friendly" },
  { value: "BETTER_ALTERNATIVE", label: "Better alternative" },
  { value: "COPY_TONE", label: "Copy tone" },
  { value: "FACTUAL_ERROR", label: "Factual error" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "SEQUENCING", label: "Sequencing" },
];

export function ReasonPicker({
  onPick,
  onCancel,
}: {
  onPick: (code: ReasonCode, note: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3 font-display text-lg">Why did you change this?</h3>
        <p className="mb-4 text-xs text-ink/60">
          Every edit is recorded — this is how we improve the model.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {REASON_CODES.map((r) => (
            <button
              key={r.value}
              onClick={() => onPick(r.value, "")}
              className="rounded border border-ink/20 px-3 py-2 text-sm hover:bg-ink/5"
            >
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={onCancel} className="mt-4 w-full text-xs text-ink/50 hover:text-ink">
          Cancel
        </button>
      </div>
    </div>
  );
}
