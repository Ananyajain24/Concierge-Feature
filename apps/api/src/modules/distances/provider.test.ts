import { describe, expect, it } from "vitest";
import { HaversineDetourProvider } from "./provider.js";

describe("HaversineDetourProvider", () => {
  it("is symmetric", async () => {
    const p = new HaversineDetourProvider();
    const a = { lat: 15.63, lng: 73.73 };
    const b = { lat: 15.59, lng: 73.74 };
    const ab = await p.compute(a, b);
    const ba = await p.compute(b, a);
    expect(ab.meters).toBe(ba.meters);
    expect(ab.seconds).toBe(ba.seconds);
  });

  it("produces a complete matrix for N nodes", async () => {
    const p = new HaversineDetourProvider();
    const nodes = [
      { id: "a", lat: 15.63, lng: 73.73 },
      { id: "b", lat: 15.59, lng: 73.74 },
      { id: "c", lat: 15.50, lng: 73.83 },
    ];
    const results: Record<string, { meters: number; seconds: number }> = {};
    for (const x of nodes) for (const y of nodes) {
      if (x.id === y.id) continue;
      results[`${x.id}|${y.id}`] = await p.compute(x, y);
    }
    // N * (N-1) pairs
    expect(Object.keys(results).length).toBe(nodes.length * (nodes.length - 1));
  });
});
