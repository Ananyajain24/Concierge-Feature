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
  /** Point at t=0.5 on the curve — the default spot for the distance label. */
  mid: Pt;
  /** Straight-line length in user units, for dash normalisation. */
  length: number;
  /** Quadratic control points, so a caller can sample other values of t when
      the default label position collides with something already placed. */
  a: Pt;
  c: Pt;
  b: Pt;
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
    mid: quadPoint(a, c, b, 0.5),
    length: span,
    a,
    c,
    b,
  };
}

/** Sample a point on the quadratic at `t` in [0,1]. */
export function quadPoint(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: round(u * u * a.x + 2 * u * t * c.x + t * t * b.x),
    y: round(u * u * a.y + 2 * u * t * c.y + t * t * b.y),
  };
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function overlaps(p: Box, q: Box, pad = 2): boolean {
  return (
    p.x - pad < q.x + q.w &&
    p.x + p.w + pad > q.x &&
    p.y - pad < q.y + q.h &&
    p.y + p.h + pad > q.y
  );
}

/**
 * Greedy label placement. Tries each candidate box in order and returns the
 * first that clears everything already placed, or null if none do — a real
 * trip can put sixteen stops on one map, and a map of overlapping text is
 * worse than a map of a few labels.
 */
export function placeLabel(taken: Box[], candidates: Box[]): Box | null {
  for (const box of candidates) {
    if (!taken.some((t) => overlaps(t, box))) {
      taken.push(box);
      return box;
    }
  }
  return null;
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

export interface Disc extends Pt {
  /** Radius the mark needs to itself, in map units. */
  r: number;
  /** Fixed marks (the villa) push others away but never move. */
  fixed?: boolean;
}

/**
 * Nudge overlapping marks apart.
 *
 * An illustrated map is not a scatter plot: on a four-day trip nine stops can
 * land within eight kilometres of the villa and stack into an unreadable pile.
 * This relaxes them just far enough to separate, with a spring back to the true
 * position so nothing wanders into the wrong bay.
 */
export function decluster(discs: Disc[], iterations = 80, pull = 0.08): Pt[] {
  const home = discs.map((d) => ({ x: d.x, y: d.y }));
  const pos = discs.map((d) => ({ x: d.x, y: d.y }));

  for (let step = 0; step < iterations; step++) {
    for (let i = 0; i < discs.length; i++) {
      for (let j = i + 1; j < discs.length; j++) {
        const a = pos[i]!;
        const b = pos[j]!;
        const need = discs[i]!.r + discs[j]!.r;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist >= need) continue;
        if (dist < 0.01) {
          // Exactly coincident: break the tie deterministically.
          dx = Math.cos(i * 2.399);
          dy = Math.sin(i * 2.399);
          dist = 1;
        }
        const push = (need - dist) / 2;
        const ux = (dx / dist) * push;
        const uy = (dy / dist) * push;
        const aFixed = discs[i]!.fixed === true;
        const bFixed = discs[j]!.fixed === true;
        if (!aFixed) {
          a.x -= bFixed ? ux * 2 : ux;
          a.y -= bFixed ? uy * 2 : uy;
        }
        if (!bFixed) {
          b.x += aFixed ? ux * 2 : ux;
          b.y += aFixed ? uy * 2 : uy;
        }
      }
    }
    // Spring home, so a mark separates but stays near where it really is.
    for (let i = 0; i < pos.length; i++) {
      if (discs[i]!.fixed) continue;
      pos[i]!.x += (home[i]!.x - pos[i]!.x) * pull;
      pos[i]!.y += (home[i]!.y - pos[i]!.y) * pull;
    }
  }

  return pos.map((p) => ({ x: round(p.x), y: round(p.y) }));
}
