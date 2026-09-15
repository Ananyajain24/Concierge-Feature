"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapViewport } from "../types";

interface Options {
  width: number;
  height: number;
  minScale?: number;
  maxScale?: number;
}

// Pan + wheel + pinch zoom. Clamps translation so the artwork always covers
// the container. No layout work — we return values you plug into a CSS transform.
export function usePanZoom(opts: Options) {
  const { minScale = 0.5, maxScale = 3 } = opts;
  const [vp, setVp] = useState<MapViewport>({ scale: 1, tx: 0, ty: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx: vp.tx, ty: vp.ty };
  }, [vp.tx, vp.ty]);

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

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setVp((prev) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const nextScale = Math.min(maxScale, Math.max(minScale, prev.scale * factor));
        // zoom towards cursor
        const k = nextScale / prev.scale;
        return clamp({
          scale: nextScale,
          tx: px - (px - prev.tx) * k,
          ty: py - (py - prev.ty) * k,
        });
      });
    },
    [clamp, minScale, maxScale],
  );

  const reset = useCallback(() => {
    setVp({ scale: 1, tx: 0, ty: 0 });
  }, []);

  // Fit the artwork on mount / resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fit = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const scale = Math.min(cw / opts.width, ch / opts.height);
      setVp({ scale, tx: (cw - opts.width * scale) / 2, ty: (ch - opts.height * scale) / 2 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [opts.width, opts.height]);

  return {
    containerRef,
    viewport: vp,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
    },
    reset,
    pinch,
  };
}
