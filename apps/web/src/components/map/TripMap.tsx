"use client";

import { useMemo, useState } from "react";
import { connectorPath } from "@lohono/itinerary-engine";
import type { MapAnchor } from "@lohono/shared-types";
import { useProjection } from "./hooks/useProjection";
import { usePanZoom } from "./hooks/usePanZoom";
import { GoaArtwork } from "./artwork/GoaArtwork";
import { Cartography } from "./Cartography";
import { Connector } from "./Connector";
import { PlaceMark } from "./PlaceMark";
import { VillaMark, VILLA_RADIUS } from "./VillaMark";
import { sceneRadius } from "./places";
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

  const placed = useMemo(
    () =>
      stops.map((stop, i) => {
        const at = project(stop.lat, stop.lng);
        const geom = connectorPath(villaAt, at, {
          insetFrom: VILLA_RADIUS,
          insetTo: sceneRadius(stop.category) + 6,
          index: i,
        });
        const km = stop.driveMeters / 1000;
        const min = Math.round(stop.driveSec / 60);
        return {
          stop,
          at,
          geom,
          label: km >= 0.1 ? `${km.toFixed(1)} km · ${min} min` : "at the villa",
        };
      }),
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
              {placed.map(({ stop, geom, label }, i) => (
                <g key={stop.id} style={{ opacity: active && active !== stop.id ? 0.32 : 1 }}>
                  <Connector id={stop.id} geom={geom} label={label} delay={0.5 + i * 0.18} />
                </g>
              ))}
            </g>

            <VillaMark x={villaAt.x} y={villaAt.y} name={villa.name} />

            <g onMouseLeave={() => setHoverId(null)}>
              {placed.map(({ stop, at }, i) => (
                <g key={stop.id} onMouseEnter={() => setHoverId(stop.id)}>
                  <PlaceMark
                    stop={stop}
                    at={at}
                    villaAt={villaAt}
                    delay={0.45 + i * 0.18}
                    dimmed={!!active && active !== stop.id}
                    onSelect={(s) => onSelect?.(selectedId === s.id ? null : s)}
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
