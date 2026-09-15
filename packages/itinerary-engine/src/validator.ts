import type { Poi, Day, Stop } from "@lohono/shared-types";

export interface ValidatorInput {
  destinationId: string;
  days: Day[];
  poisById: Record<string, Poi>;
  // seconds per stop-to-stop pair, keyed as `from|to`
  driveSecondsByPair: Record<string, number>;
  maxDailyDriveSec?: number;
}

export type ViolationKind =
  | "unknown_poi"
  | "wrong_destination"
  | "duplicate_poi"
  | "closed_on_day"
  | "drive_over_budget"
  | "empty_day"
  | "bad_slot_order";

export interface Violation {
  kind: ViolationKind;
  dayIndex?: number;
  poiId?: string;
  message: string;
}

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function dowKey(date: string): (typeof DAY_NAMES)[number] {
  const d = new Date(date);
  const idx = d.getUTCDay();
  return DAY_NAMES[idx]!;
}

const SLOT_ORDER: Record<string, number> = {
  breakfast: 0,
  morning: 1,
  lunch: 2,
  afternoon: 3,
  sunset: 4,
  dinner: 5,
  night: 6,
};

export function validateItinerary(input: ValidatorInput): Violation[] {
  const {
    days,
    poisById,
    driveSecondsByPair,
    destinationId,
    maxDailyDriveSec = 3 * 3600,
  } = input;
  const out: Violation[] = [];

  for (const day of days) {
    if (day.stops.length === 0) {
      out.push({
        kind: "empty_day",
        dayIndex: day.dayIndex,
        message: `Day ${day.dayIndex} has no stops`,
      });
      continue;
    }

    const seen = new Set<string>();
    let dayDriveSec = 0;
    let prev: Stop | null = null;

    for (const stop of day.stops) {
      const poi = poisById[stop.poiId];
      if (!poi) {
        out.push({
          kind: "unknown_poi",
          dayIndex: day.dayIndex,
          poiId: stop.poiId,
          message: `Stop references unknown POI id ${stop.poiId}`,
        });
        continue;
      }
      if (poi.destinationId !== destinationId) {
        out.push({
          kind: "wrong_destination",
          dayIndex: day.dayIndex,
          poiId: stop.poiId,
          message: `POI ${poi.name} does not belong to this destination`,
        });
      }
      if (seen.has(stop.poiId)) {
        out.push({
          kind: "duplicate_poi",
          dayIndex: day.dayIndex,
          poiId: stop.poiId,
          message: `Duplicate stop in same day: ${poi.name}`,
        });
      }
      seen.add(stop.poiId);

      const dow = dowKey(day.date);
      const hours = poi.openingHours?.[dow];
      if (hours?.closed) {
        out.push({
          kind: "closed_on_day",
          dayIndex: day.dayIndex,
          poiId: stop.poiId,
          message: `${poi.name} is closed on ${dow}`,
        });
      }

      if (prev) {
        const key = `${prev.poiId}|${stop.poiId}`;
        const secs = driveSecondsByPair[key] ?? 0;
        dayDriveSec += secs;
      }
      prev = stop;
    }

    if (dayDriveSec > maxDailyDriveSec) {
      out.push({
        kind: "drive_over_budget",
        dayIndex: day.dayIndex,
        message: `Day ${day.dayIndex} drive time ${Math.round(dayDriveSec / 60)}min exceeds budget`,
      });
    }

    let lastOrder = -1;
    for (const stop of day.stops) {
      const o = SLOT_ORDER[stop.slot] ?? 99;
      if (o < lastOrder) {
        out.push({
          kind: "bad_slot_order",
          dayIndex: day.dayIndex,
          poiId: stop.poiId,
          message: `Slot ordering broken at ${stop.slot}`,
        });
        break;
      }
      lastOrder = o;
    }
  }

  return out;
}
