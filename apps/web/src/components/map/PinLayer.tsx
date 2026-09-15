"use client";

import { motion } from "framer-motion";
import type { MapPin } from "./types";
import { categoryColor } from "./icons";

interface Props {
  pins: MapPin[];
  villa: MapPin;
  project: (lat: number, lng: number) => { x: number; y: number };
  activeDay: number | null;
  showVilla: boolean;
  showPins: boolean;
  onPinClick?: (pin: MapPin) => void;
  activePinId?: string | null;
}

export function PinLayer({
  pins,
  villa,
  project,
  activeDay,
  showVilla,
  showPins,
  onPinClick,
  activePinId,
}: Props) {
  const villaPt = project(villa.lat, villa.lng);

  return (
    <g>
      {/* Villa pin — distinct: larger, boxed */}
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: showVilla ? 1 : 0, scale: showVilla ? 1 : 0.6 }}
        transition={{ duration: 0.25 }}
      >
        <rect
          x={villaPt.x - 22}
          y={villaPt.y - 22}
          width={44}
          height={44}
          rx={8}
          fill="#fffbf0"
          stroke="#1f1d1a"
          strokeWidth={2}
        />
        <g color="#1f1d1a" transform={`translate(${villaPt.x - 10} ${villaPt.y - 10})`}>
          <use href="#icon-villa" width={20} height={20} />
        </g>
      </motion.g>

      {/* POI pins — stagger */}
      {pins.map((p, i) => {
        const pt = project(p.lat, p.lng);
        const dimmed = activeDay != null && p.dayIndex != null && p.dayIndex !== activeDay;
        const active = activePinId === p.id;
        return (
          <motion.g
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: showPins ? (dimmed ? 0.25 : 1) : 0,
              scale: showPins ? 1 : 0,
            }}
            transition={{ duration: 0.25, delay: showPins ? i * 0.06 : 0 }}
            style={{ cursor: onPinClick ? "pointer" : "default" }}
            onClick={() => onPinClick?.(p)}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={active ? 22 : 16}
              fill="#fffbf0"
              stroke={categoryColor(p.category)}
              strokeWidth={active ? 3 : 2}
            />
            <g color={categoryColor(p.category)} transform={`translate(${pt.x - 8} ${pt.y - 8})`}>
              <use href={`#icon-${p.category}`} width={16} height={16} />
            </g>
            {p.order != null && (
              <text
                x={pt.x}
                y={pt.y + 32}
                textAnchor="middle"
                fontSize="11"
                fill="#1f1d1a"
                style={{ paintOrder: "stroke fill", stroke: "#fffbf0", strokeWidth: 3 }}
              >
                {p.order + 1}
              </text>
            )}
          </motion.g>
        );
      })}
    </g>
  );
}
