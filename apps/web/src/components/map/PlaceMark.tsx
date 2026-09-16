"use client";

import styles from "./map.module.css";
import { PlaceScene } from "./places";
import type { PlacedStop } from "./layout";

// One stop on the map: its drawn scene, plus a name label only where the
// layout pass found room for one.
export function PlaceMark({
  placed,
  delay,
  dimmed,
  onSelect,
}: {
  placed: PlacedStop;
  delay: number;
  dimmed: boolean;
  onSelect?: (id: string) => void;
}) {
  const { stop, at, nameAt } = placed;
  return (
    <g
      className={styles.stop}
      style={{ opacity: dimmed ? 0.32 : 1 }}
      onClick={() => onSelect?.(stop.id)}
      role={onSelect ? "button" : undefined}
      aria-label={onSelect ? stop.name : undefined}
    >
      <g transform={`translate(${at.x},${at.y})`}>
        <g className={styles.place} style={{ animationDelay: `${delay}s` }}>
          <PlaceScene category={stop.category} name={stop.name} uid={stop.id.slice(0, 8)} />
        </g>
      </g>

      {nameAt && (
        <g className={styles.lab} style={{ animationDelay: `${delay + 0.9}s` }}>
          <text
            x={nameAt.x}
            y={nameAt.y}
            textAnchor={nameAt.anchor}
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
      )}
    </g>
  );
}
