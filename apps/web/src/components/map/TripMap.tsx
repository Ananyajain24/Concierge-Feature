"use client";

import { useMemo, useState } from "react";
import type { MapAnchor } from "@lohono/shared-types";
import { useProjection } from "./hooks/useProjection";
import { usePanZoom, type FitBounds } from "./hooks/usePanZoom";
import { GoaArtwork } from "./artwork/GoaArtwork";
import { Cartography } from "./Cartography";
import { Connector } from "./Connector";
import { PlaceMark } from "./PlaceMark";
import { VillaMark } from "./VillaMark";
import { layoutStops, type PlacedStop } from "./layout";
import type { MapStop, MapVilla } from "./types";
import type { Pt } from "@lohono/itinerary-engine";

const W = 1000;
const H = 620;

/**
 * The area the map opens on: the villa plus every stop, not the whole
 * artwork. A trip with six nearby stops should not open on a view sized for
 * the full coastline — it reads as mostly empty water and makes the actual
 * places tiny. Padded and floored so a one- or two-stop trip still keeps
 * enough surrounding artwork to read as a place, and clamped to the canvas
 * so it never asks to show past the edge of the drawing.
 */
function fitBoundsFor(villaAt: Pt, placed: PlacedStop[], canvasW: number, canvasH: number): FitBounds {
  const pad = 130;
  let x0 = villaAt.x;
  let y0 = villaAt.y;
  let x1 = villaAt.x;
  let y1 = villaAt.y;
  for (const p of placed) {
    x0 = Math.min(x0, p.at.x);
    y0 = Math.min(y0, p.at.y);
    x1 = Math.max(x1, p.at.x);
    y1 = Math.max(y1, p.at.y);
  }
  x0 -= pad;
  y0 -= pad;
  x1 += pad;
  y1 += pad;

  const minW = 480;
  const minH = 300;
  if (x1 - x0 < minW) {
    const c = (x0 + x1) / 2;
    x0 = c - minW / 2;
    x1 = c + minW / 2;
  }
  if (y1 - y0 < minH) {
    const c = (y0 + y1) / 2;
    y0 = c - minH / 2;
    y1 = c + minH / 2;
  }

  return {
    x0: Math.max(0, x0),
    y0: Math.max(0, y0),
    x1: Math.min(canvasW, x1),
    y1: Math.min(canvasH, y1),
  };
}

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
  const [hoverId, setHoverId] = useState<string | null>(null);

  const villaAt = useMemo(() => project(villa.lat, villa.lng), [project, villa.lat, villa.lng]);

  // Positions and label placement are resolved once per data change, not per
  // render — a real trip can put sixteen stops on one sheet.
  const placed = useMemo(
    () => layoutStops(stops, villaAt, project),
    [stops, project, villaAt],
  );

  const fitBounds = useMemo(() => fitBoundsFor(villaAt, placed, W, H), [villaAt, placed]);
  const { containerRef, viewport, handlers, reset, zoomBy } = usePanZoom({ width: W, height: H, fitBounds });

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

          <div className="absolute bottom-5 left-5 flex items-center gap-2">
            <button
              onClick={reset}
              className="rounded-full bg-ivory/95 px-4 py-2 text-xs text-ink hover:bg-ivory"
            >
              Reset view
            </button>
            <div className="flex overflow-hidden rounded-full bg-ivory/95">
              <button
                onClick={() => zoomBy(1 / 1.35)}
                aria-label="Zoom out"
                className="flex h-8 w-8 items-center justify-center text-ink hover:bg-ivory"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 8 H13" /></svg>
              </button>
              <span className="w-px bg-linen" />
              <button
                onClick={() => zoomBy(1.35)}
                aria-label="Zoom in"
                className="flex h-8 w-8 items-center justify-center text-ink hover:bg-ivory"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3 V13 M3 8 H13" /></svg>
              </button>
            </div>
          </div>

          <p className="pointer-events-none absolute bottom-5 right-5 rounded-full bg-ivory/95 px-4 py-2 text-xs text-graphite">
            Drag to pan · scroll the page normally
          </p>
        </>
      )}
    </div>
  );
}
