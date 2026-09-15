import { describe, expect, it } from "vitest";
import { haversineMeters, estimateDriveSeconds } from "./haversine";

describe("haversineMeters", () => {
  it("is 0 for the same point", () => {
    const p = { lat: 15.5, lng: 73.75 };
    expect(haversineMeters(p, p)).toBeCloseTo(0, 5);
  });

  it("is symmetric", () => {
    const a = { lat: 15.55, lng: 73.75 };
    const b = { lat: 15.62, lng: 73.78 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 5);
  });

  it("estimates roughly the right km", () => {
    // ~111km between 1 degree of latitude at the equator
    const a = { lat: 0, lng: 0 };
    const b = { lat: 1, lng: 0 };
    expect(haversineMeters(a, b) / 1000).toBeGreaterThan(110);
    expect(haversineMeters(a, b) / 1000).toBeLessThan(112);
  });
});

describe("estimateDriveSeconds", () => {
  it("scales with meters and detour", () => {
    const s1 = estimateDriveSeconds(10_000);
    expect(s1).toBeGreaterThan(0);
    const s2 = estimateDriveSeconds(20_000);
    expect(s2).toBeGreaterThan(s1);
  });
});
