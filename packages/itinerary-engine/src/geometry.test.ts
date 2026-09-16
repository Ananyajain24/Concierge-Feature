import { describe, expect, it } from "vitest";
import { connectorPath, decluster, labelAnchor } from "./geometry";

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

describe("decluster", () => {
  it("separates marks that land on top of each other", () => {
    const out = decluster([
      { x: 100, y: 100, r: 20 },
      { x: 104, y: 101, r: 20 },
      { x: 98, y: 103, r: 20 },
    ]);
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        expect(Math.hypot(out[i]!.x - out[j]!.x, out[i]!.y - out[j]!.y)).toBeGreaterThan(24);
      }
    }
  });

  it("keeps marks near where they really are", () => {
    const out = decluster([
      { x: 100, y: 100, r: 18 },
      { x: 108, y: 100, r: 18 },
    ]);
    expect(Math.abs(out[0]!.x - 100)).toBeLessThan(40);
    expect(Math.abs(out[1]!.x - 108)).toBeLessThan(40);
  });

  it("never moves a fixed mark", () => {
    const out = decluster([
      { x: 200, y: 200, r: 40, fixed: true },
      { x: 205, y: 200, r: 20 },
    ]);
    expect(out[0]).toEqual({ x: 200, y: 200 });
    expect(out[1]!.x).toBeGreaterThan(230);
  });

  it("leaves well-separated marks alone", () => {
    const out = decluster([
      { x: 0, y: 0, r: 10 },
      { x: 300, y: 300, r: 10 },
    ]);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 300, y: 300 });
  });
});
