"use client";

import { motion } from "framer-motion";
import type { MapRoute } from "./types";

interface Props {
  routes: MapRoute[];
  project: (lat: number, lng: number) => { x: number; y: number };
  activeDay: number | null;
  show: boolean;
  showLabels: boolean;
}

// Build a smooth quadratic Bézier between two points, with the control
// offset perpendicular by 12% of the segment length. Feels hand-drawn.
function curvedPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
): { d: string; length: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // perpendicular unit vector
  const nx = -dy / (len || 1);
  const ny = dx / (len || 1);
  const bulge = len * 0.12;
  const cx = mx + nx * bulge;
  const cy = my + ny * bulge;
  return { d: `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`, length: len * 1.05 };
}

const DAY_STROKE: Record<number, string> = {
  0: "#e07a5f",
  1: "#3d5a4d",
  2: "#4a7ba6",
  3: "#a67b4a",
  4: "#8f4a89",
  5: "#5b8f5b",
  6: "#c15b3d",
};

export function RouteLayer({ routes, project, activeDay, show, showLabels }: Props) {
  return (
    <g>
      {routes.map((r, i) => {
        const a = project(r.from.lat, r.from.lng);
        const b = project(r.to.lat, r.to.lng);
        const { d, length } = curvedPath(a, b);
        const stroke = DAY_STROKE[r.dayIndex % 7] ?? "#1f1d1a";
        const dimmed = activeDay != null && r.dayIndex !== activeDay;
        const opacity = show ? (dimmed ? 0.15 : 1) : 0;
        const pathId = `route-${r.id}`;
        return (
          <g key={r.id} opacity={opacity}>
            <motion.path
              id={pathId}
              d={d}
              stroke={stroke}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={length}
              initial={{ strokeDashoffset: length }}
              animate={{ strokeDashoffset: show ? 0 : length }}
              transition={{ duration: 0.8, delay: show ? i * 0.15 : 0, ease: "easeInOut" }}
            />
            {showLabels && (
              <motion.text
                fontSize="12"
                fontWeight={600}
                fill={stroke}
                style={{
                  paintOrder: "stroke fill",
                  stroke: "#fffbf0",
                  strokeWidth: 4,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: showLabels && !dimmed ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                  {r.driveMin}m · {r.driveKm.toFixed(1)}km
                </textPath>
              </motion.text>
            )}
          </g>
        );
      })}
    </g>
  );
}
