// Pure view geometry for the illustrated map: where a connector runs between
// the villa and a stop, and where its distance label sits.
//
// This lives in the engine (no I/O, no framework) so the same maths can be run
// at publish time to bake `mapOverlay` into the snapshot — see docs/PLAN.md.

export interface Pt {
  x: number;
  y: number;
}

export interface Connector {
  /** SVG path data for the curve. */
  d: string;
  /** Point at t=0.5 on the curve — where the distance label goes. */
  mid: Pt;
  /** Straight-line length in user units, for dash normalisation. */
  length: number;
}

/**
 * A gently bowed quadratic from `from` to `to`, inset at both ends so the line
 * emerges from under the villa and stops short of the stop's artwork.
 *
 * `bow` is the perpendicular offset of the control point as a fraction of the
 * segment length; the sign alternates by `index` so fanned-out connectors do
 * not all curve the same way.
 */
export function connectorPath(
  from: Pt,
  to: Pt,
  opts: { insetFrom?: number; insetTo?: number; bow?: number; index?: number } = {},
): Connector {
  const { insetFrom = 0, insetTo = 0, bow = 0.08, index = 0 } = opts;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  // Never inset past the midpoint — short hops would otherwise invert.
  const a: Pt = { x: from.x + ux * Math.min(insetFrom, len * 0.4), y: from.y + uy * Math.min(insetFrom, len * 0.4) };
  const b: Pt = { x: to.x - ux * Math.min(insetTo, len * 0.4), y: to.y - uy * Math.min(insetTo, len * 0.4) };

  const span = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const sign = index % 2 === 0 ? 1 : -1;
  const off = span * bow * sign;
  const c: Pt = {
    x: (a.x + b.x) / 2 + (-(b.y - a.y) / span) * off,
    y: (a.y + b.y) / 2 + ((b.x - a.x) / span) * off,
  };

  return {
    d: `M${round(a.x)} ${round(a.y)} Q ${round(c.x)} ${round(c.y)} ${round(b.x)} ${round(b.y)}`,
    mid: { x: round(0.25 * a.x + 0.5 * c.x + 0.25 * b.x), y: round(0.25 * a.y + 0.5 * c.y + 0.25 * b.y) },
    length: span,
  };
}

/** Which side of the villa a stop sits on, so its name label points outward. */
export function labelAnchor(villa: Pt, place: Pt): { anchor: "start" | "middle" | "end"; dx: number; dy: number } {
  const dx = place.x - villa.x;
  const dy = place.y - villa.y;
  if (Math.abs(dx) > Math.abs(dy) * 1.2) {
    return dx > 0 ? { anchor: "start", dx: 14, dy: 4 } : { anchor: "end", dx: -14, dy: 4 };
  }
  return dy > 0 ? { anchor: "middle", dx: 0, dy: 22 } : { anchor: "middle", dx: 0, dy: -12 };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
