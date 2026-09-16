"use client";

import { labelAnchor } from "@lohono/itinerary-engine";
import styles from "./map.module.css";
import { PlaceScene, sceneRadius } from "./places";
import type { MapStop } from "./types";

// One stop on the map: its drawn scene plus a name label set on the side
// facing away from the villa, so labels never crowd the middle.
export function PlaceMark({
  stop,
  at,
  villaAt,
  delay,
  dimmed,
  onSelect,
}: {
  stop: MapStop;
  at: { x: number; y: number };
  villaAt: { x: number; y: number };
  delay: number;
  dimmed: boolean;
  onSelect?: (stop: MapStop) => void;
}) {
  const { anchor, dx, dy } = labelAnchor(villaAt, at);
  const r = sceneRadius(stop.category);
  const lx = at.x + dx + (anchor === "start" ? r : anchor === "end" ? -r : 0);
  const ly = at.y + dy + (dy < 0 ? -r * 0.9 : 0);

  return (
    <g
      className={styles.stop}
      style={{ opacity: dimmed ? 0.32 : 1 }}
      onClick={() => onSelect?.(stop)}
      role={onSelect ? "button" : undefined}
      aria-label={onSelect ? stop.name : undefined}
    >
      <g transform={`translate(${at.x},${at.y})`}>
        <g className={styles.place} style={{ animationDelay: `${delay}s` }}>
          <PlaceScene category={stop.category} name={stop.name} uid={stop.id.slice(0, 8)} />
        </g>
      </g>

      <g className={styles.lab} style={{ animationDelay: `${delay + 0.9}s` }}>
        <text
          x={lx}
          y={ly}
          textAnchor={anchor}
          fontSize={17}
          fontWeight={600}
          fill="var(--l-ink)"
          paintOrder="stroke"
          stroke="var(--l-map-sand)"
          strokeWidth={3.5}
          strokeLinejoin="round"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {stop.name}
        </text>
      </g>
    </g>
  );
}
