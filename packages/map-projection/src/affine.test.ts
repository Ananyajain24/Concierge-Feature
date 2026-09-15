import { describe, expect, it } from "vitest";
import { fitAffine, project } from "./affine.js";

describe("fitAffine", () => {
  it("recovers an exact affine when given clean anchors", () => {
    // ground truth: x = 1000*lng + 0*lat + 0; y = 0*lng - 800*lat + 5000
    const anchors = [
      { lng: 0, lat: 0, x: 0, y: 5000 },
      { lng: 1, lat: 0, x: 1000, y: 5000 },
      { lng: 0, lat: 1, x: 0, y: 4200 },
      { lng: 1, lat: 1, x: 1000, y: 4200 },
    ];
    const m = fitAffine(anchors);
    const p = project(m, 0.5, 0.5);
    expect(p.x).toBeCloseTo(500, 1);
    expect(p.y).toBeCloseTo(4600, 1);
  });
});
