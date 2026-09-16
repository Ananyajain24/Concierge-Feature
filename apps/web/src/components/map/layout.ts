import {
  connectorPath,
  decluster,
  labelAnchor,
  placeLabel,
  quadPoint,
  type Box,
  type Connector,
  type Disc,
  type Pt,
} from "@lohono/itinerary-engine";
import { sceneRadius } from "./places";
import type { MapStop } from "./types";
import { VILLA_RADIUS } from "./VillaMark";

export interface PlacedStop {
  stop: MapStop;
  at: Pt;
  geom: Connector;
  label: string;
  /** Where the distance pill goes, or null when there was no room for it. */
  pillAt: Pt | null;
  pillWidth: number;
  /** Null when the name label had nowhere to go without overlapping. */
  nameAt: (Pt & { anchor: "start" | "middle" | "end" }) | null;
}

const CHAR_W = 8.2; // Cormorant Garamond at 17px, near enough for boxing
const NAME_H = 20;
const PILL_H = 18;

/**
 * Turn the trip's stops into everything the map needs to draw, resolving
 * label collisions once rather than per render. Stops furthest from the villa
 * are laid out first: they have the most open space around them, and the
 * cluster near the villa is where labels have to give way.
 */
export function layoutStops(
  stops: MapStop[],
  villaAt: Pt,
  project: (lat: number, lng: number) => Pt,
): PlacedStop[] {
  const taken: Box[] = [
    // the villa's own art and ribbon are never written over
    { x: villaAt.x - 58, y: villaAt.y - 46, w: 116, h: 78 },
  ];

  // Project, then relax: a four-day trip routinely puts nine stops inside eight
  // kilometres of the villa, which lands them in a pile on an illustrated map.
  const discs: Disc[] = [
    { ...villaAt, r: VILLA_RADIUS + 6, fixed: true },
    ...stops.map((stop) => {
      const p = project(stop.lat, stop.lng);
      return { x: p.x, y: p.y, r: sceneRadius(stop.category) + 10 };
    }),
  ];
  const relaxed = decluster(discs);
  const pointFor = new Map<string, Pt>(stops.map((s, i) => [s.id, relaxed[i + 1]!]));

  const order = stops
    .map((stop, i) => ({ stop, i }))
    .sort((p, q) => q.stop.driveMeters - p.stop.driveMeters);

  const out = new Map<string, PlacedStop>();

  for (const { stop, i } of order) {
    const at = pointFor.get(stop.id)!;
    const geom = connectorPath(villaAt, at, {
      insetFrom: VILLA_RADIUS,
      insetTo: sceneRadius(stop.category) + 6,
      index: i,
    });

    const km = stop.driveMeters / 1000;
    const min = Math.round(stop.driveSec / 60);
    const label = km >= 0.1 ? `${km.toFixed(1)} km · ${min} min` : "at the villa";
    const pillWidth = Math.max(58, label.length * 5.8 + 16);

    // The pill slides along its own connector until it finds room. Staggering
    // the starting point by index fans neighbouring spokes onto different radii
    // instead of lining every pill up at the same distance from the villa.
    const base = 0.4 + (i % 3) * 0.14;
    let pillAt: Pt | null = null;
    for (const d of [0, 0.13, -0.13, 0.26, -0.24, 0.38]) {
      const t = Math.min(0.82, Math.max(0.22, base + d));
      const p = quadPoint(geom.a, geom.c, geom.b, t);
      const box = { x: p.x - pillWidth / 2, y: p.y - PILL_H / 2, w: pillWidth, h: PILL_H };
      if (!taken.some((b) => intersects(b, box))) {
        taken.push(box);
        pillAt = p;
        break;
      }
    }

    // The name sits outward from the villa; if every side is taken it is
    // dropped rather than stacked on top of another label.
    const { anchor, dx, dy } = labelAnchor(villaAt, at);
    const r = sceneRadius(stop.category);
    const w = stop.name.length * CHAR_W;
    const cands: Array<Box & { anchor: "start" | "middle" | "end" }> = [];
    const push = (x: number, y: number, a: "start" | "middle" | "end") =>
      cands.push({
        x: a === "start" ? x : a === "end" ? x - w : x - w / 2,
        y: y - NAME_H + 4,
        w,
        h: NAME_H,
        anchor: a,
      });

    const baseX = at.x + dx + (anchor === "start" ? r : anchor === "end" ? -r : 0);
    const baseY = at.y + dy + (dy < 0 ? -r * 0.9 : 0);
    push(baseX, baseY, anchor);
    push(at.x, at.y + 22, "middle");
    push(at.x, at.y - r - 10, "middle");
    push(at.x + r + 14, at.y + 4, "start");
    push(at.x - r - 14, at.y + 4, "end");

    const chosen = placeLabel(taken, cands) as (Box & { anchor?: string }) | null;
    const hit = chosen ? cands.find((c) => c.x === chosen.x && c.y === chosen.y) : undefined;

    out.set(stop.id, {
      stop,
      at,
      geom,
      label,
      pillAt,
      pillWidth,
      nameAt: hit
        ? {
            x: hit.anchor === "start" ? hit.x : hit.anchor === "end" ? hit.x + w : hit.x + w / 2,
            y: hit.y + NAME_H - 4,
            anchor: hit.anchor,
          }
        : null,
    });
  }

  // Back to trip order so animation delays follow the days.
  return stops.map((s) => out.get(s.id)!).filter(Boolean);
}

function intersects(p: Box, q: Box): boolean {
  return p.x - 2 < q.x + q.w && p.x + p.w + 2 > q.x && p.y - 2 < q.y + q.h && p.y + p.h + 2 > q.y;
}
