"use client";

import { useMemo, useState } from "react";
import type { MapAnchor } from "@lohono/shared-types";
import { useProjection } from "./hooks/useProjection";
import { usePanZoom } from "./hooks/usePanZoom";
import { GoaArtwork } from "./artwork/GoaArtwork";
import { Cartography } from "./Cartography";
import { Connector } from "./Connector";
import { PlaceMark } from "./PlaceMark";
import { VillaMark } from "./VillaMark";
import { layoutStops } from "./layout";
import type { MapStop, MapVilla } from "./types";

const W = 1000;
const H = 620;

/**
 * One map for the whole trip. The villa sits where it really is, every stop is
 * a drawn scene at its projected position, and a dotted line carries the drive
 * from the villa to each. There is no day filter and no stop-to-stop chain —
 * the map answers "how far is that from where I'm staying", nothing else.
 */
export function TripMap({
  anchors,
  villa,
  stops,
  selectedId,
  onSelect,
  showChrome = true,
}: {
  anchors: MapAnchor[];
  villa: MapVilla;
  stops: MapStop[];
  selectedId?: string | null;
  onSelect?: (stop: MapStop | null) => void;
  showChrome?: boolean;
}) {
  const project = useProjection(anchors);
  const { containerRef, viewport, handlers, reset } = usePanZoom({ width: W, height: H });
  const [hoverId, setHoverId] = useState<string | null>(null);

  const villaAt = useMemo(() => project(villa.lat, villa.lng), [project, villa.lat, villa.lng]);

  // Positions and label placement are resolved once per data change, not per
  // render — a real trip can put sixteen stops on one sheet.
  const placed = useMemo(
    () => layoutStops(stops, villaAt, project),
    [stops, project, villaAt],
  );

  const active = selectedId ?? hoverId;

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-sea"
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none select-none"
        style={{ cursor: "grab" }}
        {...handlers}
      >
        <div
          style={{
            width: W,
            height: H,
            transform: `translate3d(${viewport.tx}px, ${viewport.ty}px, 0) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
            {/* Goa is the only destination in the MVP; a second one adds a
                sibling artwork component keyed off the destination slug. */}
            <GoaArtwork />

            <g>
              {placed.map((p, i) => (
                <g key={p.stop.id} style={{ opacity: active && active !== p.stop.id ? 0.32 : 1 }}>
                  <Connector placed={p} delay={0.5 + i * 0.12} />
                </g>
              ))}
            </g>

            <VillaMark x={villaAt.x} y={villaAt.y} name={villa.name} />

            <g onMouseLeave={() => setHoverId(null)}>
              {placed.map((p, i) => (
                <g key={p.stop.id} onMouseEnter={() => setHoverId(p.stop.id)}>
                  <PlaceMark
                    placed={p}
                    delay={0.45 + i * 0.12}
                    dimmed={!!active && active !== p.stop.id}
                    onSelect={(id) => onSelect?.(selectedId === id ? null : p.stop)}
                  />
                </g>
              ))}
            </g>

            <Cartography />
          </svg>
        </div>
      </div>

      {showChrome && (
        <>
          <div className="pointer-events-none absolute left-5 top-5 max-w-[240px] rounded-md bg-ivory/95 p-4">
            <p className="eyebrow">Your trip at a glance</p>
            <p className="mt-1.5 font-display text-[23px] leading-tight">
              {stops.length} {stops.length === 1 ? "place" : "places"}, one map
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-graphite">
              Every distance shown is the drive from {villa.name}.
            </p>
          </div>
          <button
            onClick={reset}
            className="absolute bottom-5 left-5 rounded-full bg-ivory/95 px-4 py-2 text-xs text-ink hover:bg-ivory"
          >
            Reset view
          </button>
          <p className="pointer-events-none absolute bottom-5 right-5 rounded-full bg-ivory/95 px-4 py-2 text-xs text-graphite">
            Tap a place · drag to pan
          </p>
        </>
      )}
    </div>
  );
}
