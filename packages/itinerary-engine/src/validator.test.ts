import { describe, expect, it } from "vitest";
import { validateItinerary } from "./validator.js";
import type { Poi, Day } from "@lohono/shared-types";

const DEST_ID = "11111111-1111-1111-1111-111111111111";

function poi(id: string, over: Partial<Poi> = {}): Poi {
  return {
    id,
    destinationId: DEST_ID,
    name: `POI ${id}`,
    category: "beach",
    lat: 15.5,
    lng: 73.75,
    vibeTags: [],
    priceBand: "$$",
    avgDurationMin: 60,
    openingHours: {
      mon: { open: "08:00", close: "18:00", closed: false },
      tue: { open: "08:00", close: "18:00", closed: false },
      wed: { open: "08:00", close: "18:00", closed: false },
      thu: { open: "08:00", close: "18:00", closed: false },
      fri: { open: "08:00", close: "18:00", closed: false },
      sat: { open: "08:00", close: "18:00", closed: false },
      sun: { open: "08:00", close: "18:00", closed: false },
    },
    seasonality: { best_months: [], avoid_months: [] },
    kidFriendly: true,
    bookable: false,
    conciergeNote: "",
    qualityScore: 0.8,
    ...over,
  };
}

function day(idx: number, date: string, poiIds: string[]): Day {
  return {
    dayIndex: idx,
    date,
    theme: "",
    stops: poiIds.map((pid, i) => ({
      id: `s-${idx}-${i}`,
      poiId: pid,
      slot: (["morning", "lunch", "afternoon", "sunset", "dinner"] as const)[i] ?? "night",
      order: i,
      isPinned: false,
      copy: "",
      driveFromPreviousSec: 0,
      driveFromPreviousMeters: 0,
      warnings: [],
    })),
  };
}

describe("validateItinerary", () => {
  it("flags hallucinated IDs", () => {
    const p1 = poi("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    const days = [day(0, "2026-01-05", [p1.id, "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"])];
    const violations = validateItinerary({
      destinationId: DEST_ID,
      days,
      poisById: { [p1.id]: p1 },
      driveSecondsByPair: {},
    });
    expect(violations.some((v) => v.kind === "unknown_poi")).toBe(true);
  });

  it("flags impossibly long drive days", () => {
    const a = poi("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    const b = poi("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    const days = [day(0, "2026-01-05", [a.id, b.id])];
    const violations = validateItinerary({
      destinationId: DEST_ID,
      days,
      poisById: { [a.id]: a, [b.id]: b },
      driveSecondsByPair: { [`${a.id}|${b.id}`]: 4 * 3600 },
    });
    expect(violations.some((v) => v.kind === "drive_over_budget")).toBe(true);
  });

  it("flags a Tuesday-closed POI on Tuesday", () => {
    const a = poi("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", {
      openingHours: {
        mon: { open: null, close: null, closed: false },
        tue: { open: null, close: null, closed: true },
        wed: { open: null, close: null, closed: false },
        thu: { open: null, close: null, closed: false },
        fri: { open: null, close: null, closed: false },
        sat: { open: null, close: null, closed: false },
        sun: { open: null, close: null, closed: false },
      },
    });
    // 2026-01-06 is a Tuesday
    const days = [day(0, "2026-01-06", [a.id])];
    const violations = validateItinerary({
      destinationId: DEST_ID,
      days,
      poisById: { [a.id]: a },
      driveSecondsByPair: {},
    });
    expect(violations.some((v) => v.kind === "closed_on_day")).toBe(true);
  });

  it("passes a clean itinerary", () => {
    const a = poi("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    const b = poi("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    const days = [day(0, "2026-01-05", [a.id, b.id])];
    const violations = validateItinerary({
      destinationId: DEST_ID,
      days,
      poisById: { [a.id]: a, [b.id]: b },
      driveSecondsByPair: { [`${a.id}|${b.id}`]: 600 },
    });
    expect(violations).toEqual([]);
  });
});
