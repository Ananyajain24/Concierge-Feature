import { describe, expect, it } from "vitest";
import { connectorPath, labelAnchor } from "./geometry";

const villa = { x: 400, y: 300 };

describe("connectorPath", () => {
  it("starts and ends inside the segment once inset", () => {
    const c = connectorPath(villa, { x: 600, y: 300 }, { insetFrom: 40, insetTo: 20 });
    expect(c.d.startsWith("M440 300")).toBe(true);
    expect(c.d.endsWith("580 300")).toBe(true);
    expect(c.length).toBeCloseTo(140, 0);
  });

  it("never insets past the midpoint on a short hop", () => {
    const c = connectorPath(villa, { x: 420, y: 300 }, { insetFrom: 200, insetTo: 200 });
    // 20px apart, inset capped at 40% each side, so something is still drawn.
    expect(c.length).toBeGreaterThan(0);
  });

  it("bows alternate sides so fanned connectors do not overlap", () => {
    const even = connectorPath(villa, { x: 600, y: 300 }, { index: 0 });
    const odd = connectorPath(villa, { x: 600, y: 300 }, { index: 1 });
    expect(even.mid.y).toBeGreaterThan(300);
    expect(odd.mid.y).toBeLessThan(300);
  });

  it("puts the label at t=0.5 on the curve", () => {
    const c = connectorPath(villa, { x: 600, y: 300 }, { bow: 0 });
    expect(c.mid).toEqual({ x: 500, y: 300 });
  });
});

describe("labelAnchor", () => {
  it("points the label away from the villa", () => {
    expect(labelAnchor(villa, { x: 700, y: 300 }).anchor).toBe("start");
    expect(labelAnchor(villa, { x: 100, y: 300 }).anchor).toBe("end");
    expect(labelAnchor(villa, { x: 400, y: 500 })).toMatchObject({ anchor: "middle" });
    expect(labelAnchor(villa, { x: 400, y: 100 }).dy).toBeLessThan(0);
  });
});
