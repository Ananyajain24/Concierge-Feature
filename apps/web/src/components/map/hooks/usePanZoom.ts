"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapViewport } from "../types";

export interface FitBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Options {
  width: number;
  height: number;
  /** Artwork-unit box to fit on mount/resize/reset, instead of the whole
      canvas — this is what keeps a small cluster of stops from rendering as
      a tiny huddle inside a mostly-empty map. */
  fitBounds?: FitBounds;
  minScale?: number;
  maxScale?: number;
}

// Drag to pan, the +/- buttons to zoom. The wheel/trackpad never does
// anything to the map, in either direction — see the note on onWheel's old
// home below for why even a ctrl-gated version of that still misbehaved.
export function usePanZoom(opts: Options) {
  const { minScale = 0.3, maxScale = 5 } = opts;
  const [vp, setVp] = useState<MapViewport>({ scale: 1, tx: 0, ty: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const fitBoundsKey = opts.fitBounds
    ? `${opts.fitBounds.x0},${opts.fitBounds.y0},${opts.fitBounds.x1},${opts.fitBounds.y1}`
    : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fitBounds = useMemo(() => opts.fitBounds, [fitBoundsKey]);

  const clamp = useCallback(
    (next: MapViewport): MapViewport => {
      const el = containerRef.current;
      if (!el) return next;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const sw = opts.width * next.scale;
      const sh = opts.height * next.scale;
      const minTx = Math.min(0, cw - sw);
      const minTy = Math.min(0, ch - sh);
      return {
        scale: next.scale,
        tx: Math.min(0, Math.max(minTx, next.tx)),
        ty: Math.min(0, Math.max(minTy, next.ty)),
      };
    },
    [opts.width, opts.height],
  );

  const fit = useCallback((): MapViewport => {
    const el = containerRef.current;
    if (!el) return { scale: 1, tx: 0, ty: 0 };
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const b = fitBounds ?? { x0: 0, y0: 0, x1: opts.width, y1: opts.height };
    const bw = Math.max(1, b.x1 - b.x0);
    const bh = Math.max(1, b.y1 - b.y0);
    const scale = Math.min(cw / bw, ch / bh);
    return {
      scale,
      tx: (cw - bw * scale) / 2 - b.x0 * scale,
      ty: (ch - bh * scale) / 2 - b.y0 * scale,
    };
  }, [fitBounds, opts.width, opts.height]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      drag.current = { x: e.clientX, y: e.clientY, tx: vp.tx, ty: vp.ty };
    },
    [vp.tx, vp.ty],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      setVp((prev) => clamp({ ...prev, tx: drag.current!.tx + dx, ty: drag.current!.ty + dy }));
    },
    [clamp],
  );

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  // The wheel does nothing at all, on purpose — not even ctrl+wheel. A
  // laptop trackpad reports two-finger pinch as a wheel event with
  // ctrlKey:true regardless of whether Ctrl is actually held, and an
  // imprecise two-finger *scroll* attempt commonly carries a little pinch
  // with it too. Gating zoom on ctrlKey therefore still fired mid-scroll on
  // a trackpad — the exact "keeps zooming in and out" complaint. The map is
  // fully static under any wheel/trackpad input now; the +/- buttons are the
  // only way to zoom.
  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const cx = el.clientWidth / 2;
      const cy = el.clientHeight / 2;
      setVp((prev) => {
        const nextScale = Math.min(maxScale, Math.max(minScale, prev.scale * factor));
        const k = nextScale / prev.scale;
        return clamp({ scale: nextScale, tx: cx - (cx - prev.tx) * k, ty: cy - (cy - prev.ty) * k });
      });
    },
    [clamp, minScale, maxScale],
  );

  const reset = useCallback(() => {
    setVp(fit());
  }, [fit]);

  // Fit on mount, on container resize, and whenever the content bounds change
  // (a swap can move where the cluster of stops actually sits).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => setVp(fit());
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  return {
    containerRef,
    viewport: vp,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    reset,
    zoomBy,
  };
}
