"use client";

import { useMemo, useRef, useState } from "react";
import type { MapAnchor } from "@lohono/shared-types";
import { useProjection } from "./hooks/useProjection";
import { usePanZoom } from "./hooks/usePanZoom";
import { useAnimationSequence } from "./hooks/useAnimationSequence";
import { PinLayer } from "./PinLayer";
import { RouteLayer } from "./RouteLayer";
import { DayFilter } from "./DayFilter";
import { IconSprite } from "./icons";
import type { MapPin, MapRoute } from "./types";

interface Props {
  imageUrl: string;
  width: number;
  height: number;
  anchors: MapAnchor[];
  villa: MapPin;
  pins: MapPin[];
  routes: MapRoute[];
  onPinClick?: (pin: MapPin) => void;
  activePinId?: string | null;
  dayCount?: number;
  showControls?: boolean;
  className?: string;
}

export function MapCanvas({
  imageUrl,
  width,
  height,
  anchors,
  villa,
  pins,
  routes,
  onPinClick,
  activePinId,
  dayCount,
  showControls = true,
  className,
}: Props) {
  const project = useProjection(anchors);
  const { containerRef, viewport, handlers, reset } = usePanZoom({ width, height });
  const outerRef = useRef<HTMLDivElement | null>(null);
  const { isVisible, stage, skip } = useAnimationSequence(outerRef);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const effectiveDayCount = useMemo(
    () => dayCount ?? (pins.reduce((m, p) => Math.max(m, p.dayIndex ?? -1), -1) + 1),
    [dayCount, pins],
  );

  return (
    <div
      ref={outerRef}
      className={"relative overflow-hidden rounded-lg bg-[#c8dcea] " + (className ?? "")}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <IconSprite />
      <div
        ref={containerRef}
        className="absolute inset-0 select-none touch-none"
        style={{ cursor: "grab" }}
        {...handlers}
      >
        <div
          style={{
            width,
            height,
            transform: `translate3d(${viewport.tx}px, ${viewport.ty}px, 0) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{
              display: "block",
              opacity: isVisible("artwork") ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
          >
            <image href={imageUrl} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
            <RouteLayer
              routes={routes}
              project={project}
              activeDay={activeDay}
              show={isVisible("routes")}
              showLabels={isVisible("labels")}
            />
            <PinLayer
              pins={pins}
              villa={villa}
              project={project}
              activeDay={activeDay}
              showVilla={isVisible("villa")}
              showPins={isVisible("pins")}
              onPinClick={onPinClick}
              activePinId={activePinId}
            />
          </svg>
        </div>
      </div>

      {showControls && effectiveDayCount > 1 && (
        <DayFilter dayCount={effectiveDayCount} activeDay={activeDay} onChange={setActiveDay} />
      )}

      <div className="absolute bottom-3 left-3 flex gap-2">
        <button
          onClick={reset}
          className="rounded-full bg-white/85 px-3 py-1 text-xs text-ink shadow-sm backdrop-blur hover:bg-white"
        >
          Reset view
        </button>
        {stage !== "done" && stage !== "idle" && (
          <button
            onClick={skip}
            className="rounded-full bg-white/85 px-3 py-1 text-xs text-ink shadow-sm backdrop-blur hover:bg-white"
          >
            Skip animation
          </button>
        )}
      </div>
    </div>
  );
}
