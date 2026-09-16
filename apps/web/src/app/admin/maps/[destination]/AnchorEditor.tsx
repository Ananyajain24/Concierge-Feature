"use client";

import { useMemo, useRef, useState } from "react";
import type { MapAnchor } from "@lohono/shared-types";
import { leaveOneOutErrors } from "@lohono/map-projection";

interface Props {
  imageUrl: string;
  width: number;
  height: number;
  initialAnchors: MapAnchor[];
}

export function AnchorEditor({ imageUrl, width, height, initialAnchors }: Props) {
  const [anchors, setAnchors] = useState<MapAnchor[]>(initialAnchors);
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [label, setLabel] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  const errors = useMemo(() => leaveOneOutErrors(anchors), [anchors]);
  const meanError = errors.length ? errors.reduce((s, e) => s + e.errorPx, 0) / errors.length : 0;

  function onSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const inv = svg.getScreenCTM()?.inverse();
    if (!inv) return;
    const p = pt.matrixTransform(inv);
    setPending({ x: p.x, y: p.y });
  }

  function addAnchor() {
    if (!pending || !lat || !lng) return;
    const id = label.toLowerCase().replace(/\s+/g, "-") || `anchor-${anchors.length + 1}`;
    setAnchors((cur) => [
      ...cur,
      { id, lat: Number(lat), lng: Number(lng), x: pending.x, y: pending.y, label: label || id },
    ]);
    setPending(null);
    setLat(""); setLng(""); setLabel("");
  }

  function removeAnchor(id: string) {
    setAnchors((cur) => cur.filter((a) => a.id !== id));
  }

  function download() {
    const blob = new Blob([JSON.stringify({ kind: "affine", width, height, anchors, matrix: [0,0,0,0,0,0] }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transform.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 overflow-hidden rounded border border-linen bg-ivory">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full cursor-crosshair"
          onClick={onSvgClick}
        >
          <image href={imageUrl} width={width} height={height} />
          {anchors.map((a) => (
            <g key={a.id}>
              <circle cx={a.x} cy={a.y} r={12} fill="#e07a5f" stroke="#1f1d1a" strokeWidth={2} />
              <text
                x={a.x + 16}
                y={a.y + 5}
                fontSize={16}
                fill="#1f1d1a"
                style={{ paintOrder: "stroke fill", stroke: "#fff", strokeWidth: 3 }}
              >
                {a.label ?? a.id}
              </text>
            </g>
          ))}
          {pending && (
            <circle cx={pending.x} cy={pending.y} r={14} fill="none" stroke="#4a7ba6" strokeWidth={3} />
          )}
        </svg>
      </div>

      <aside className="space-y-4">
        <div className="rounded border border-linen bg-ivory p-4">
          <h2 className="mb-2 font-medium">Fit quality</h2>
          <p className="text-sm">Anchors: {anchors.length}</p>
          <p className="text-sm">Mean LOO error: <span className="font-mono">{meanError.toFixed(2)}px</span></p>
          {errors.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-y-auto text-xs">
              {errors.map((e) => (
                <li key={e.index} className="flex justify-between text-graphite">
                  <span>{e.anchor.label ?? e.anchor.id}</span>
                  <span className="font-mono">{e.errorPx.toFixed(1)}px</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded border border-linen bg-ivory p-4 space-y-2">
          <h2 className="mb-1 font-medium">Add anchor</h2>
          {pending ? (
            <p className="text-xs text-graphite">Selected: {pending.x.toFixed(0)}, {pending.y.toFixed(0)}</p>
          ) : (
            <p className="text-xs text-muted">Click a point on the map…</p>
          )}
          <input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full rounded border border-linen px-2 py-1 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} className="rounded border border-linen px-2 py-1 text-sm" />
            <input placeholder="Lng" value={lng} onChange={(e) => setLng(e.target.value)} className="rounded border border-linen px-2 py-1 text-sm" />
          </div>
          <button onClick={addAnchor} disabled={!pending || !lat || !lng} className="w-full rounded bg-ink py-1.5 text-sm text-ivory disabled:opacity-40">
            Add
          </button>
        </div>

        <div className="rounded border border-linen bg-ivory p-4">
          <h2 className="mb-2 font-medium">Anchors</h2>
          <ul className="space-y-1 text-xs">
            {anchors.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span>{a.label ?? a.id}</span>
                <button onClick={() => removeAnchor(a.id)} className="text-terracotta">remove</button>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={download} className="w-full rounded bg-ink px-3 py-2 text-sm text-ivory hover:opacity-90">
          Download transform.json
        </button>
      </aside>
    </div>
  );
}
