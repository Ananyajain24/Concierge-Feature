import { fitAffine, project, type AnchorPoint } from "./affine.js";

export interface AnchorError {
  index: number;
  anchor: AnchorPoint;
  errorPx: number;
}

// Leave-one-out validation: fit on N-1 anchors, measure pixel error on the excluded one.
export function leaveOneOutErrors(anchors: AnchorPoint[]): AnchorError[] {
  if (anchors.length < 4) return [];
  const errors: AnchorError[] = [];
  for (let i = 0; i < anchors.length; i++) {
    const subset = anchors.filter((_, j) => j !== i);
    const m = fitAffine(subset);
    const a = anchors[i]!;
    const p = project(m, a.lat, a.lng);
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    errors.push({ index: i, anchor: a, errorPx: Math.sqrt(dx * dx + dy * dy) });
  }
  return errors;
}
