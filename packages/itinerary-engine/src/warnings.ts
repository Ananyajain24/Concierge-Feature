import type { Day, Poi } from "@lohono/shared-types";
import type { WarningCode } from "@lohono/shared-types";

export interface WarningsInput {
  days: Day[];
  poisById: Record<string, Poi>;
  driveSecondsByPair: Record<string, number>;
  travelMonth: number; // 1..12
  hasYoungKids: boolean;
}

export interface StopWarning {
  dayIndex: number;
  poiId: string;
  code: WarningCode;
}
export interface DayWarning {
  dayIndex: number;
  code: WarningCode;
}

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const dowKey = (date: string) => DAY_NAMES[new Date(date).getUTCDay()]!;

export function computeWarnings(input: WarningsInput): {
  stopWarnings: StopWarning[];
  dayWarnings: DayWarning[];
} {
  const stopWarnings: StopWarning[] = [];
  const dayWarnings: DayWarning[] = [];

  for (const day of input.days) {
    let dayDrive = 0;
    const categoryCounts: Record<string, number> = {};
    const vibeCounts: Record<string, number> = {};

    for (let i = 0; i < day.stops.length; i++) {
      const stop = day.stops[i]!;
      const poi = input.poisById[stop.poiId];
      if (!poi) continue;

      categoryCounts[poi.category] = (categoryCounts[poi.category] ?? 0) + 1;
      for (const t of poi.vibeTags) vibeCounts[t] = (vibeCounts[t] ?? 0) + 1;

      const dow = dowKey(day.date);
      if (poi.openingHours?.[dow]?.closed) {
        stopWarnings.push({ dayIndex: day.dayIndex, poiId: stop.poiId, code: "CLOSED_TODAY" });
      }

      if (poi.seasonality?.avoid_months?.includes(input.travelMonth)) {
        stopWarnings.push({ dayIndex: day.dayIndex, poiId: stop.poiId, code: "SEASON_OFF" });
      }

      if (input.hasYoungKids && !poi.kidFriendly) {
        stopWarnings.push({ dayIndex: day.dayIndex, poiId: stop.poiId, code: "KID_UNFRIENDLY" });
      }

      if (i > 0) {
        const prev = day.stops[i - 1]!;
        const key = `${prev.poiId}|${stop.poiId}`;
        const secs = input.driveSecondsByPair[key] ?? 0;
        dayDrive += secs;
        const prevPoi = input.poisById[prev.poiId];
        const gap = 30 * 60;
        if (prevPoi && secs < gap && prevPoi.avgDurationMin < 60) {
          stopWarnings.push({ dayIndex: day.dayIndex, poiId: stop.poiId, code: "TIMING_TIGHT" });
        }
      }
    }

    if (dayDrive > 3 * 3600) {
      dayWarnings.push({ dayIndex: day.dayIndex, code: "DRIVE_HEAVY" });
    }
    if ((categoryCounts.restaurant ?? 0) + (categoryCounts.cafe ?? 0) >= 3) {
      dayWarnings.push({ dayIndex: day.dayIndex, code: "CATEGORY_HEAVY" });
    }
  }

  // REPEAT_VIBE across days
  const dayVibes: Set<string>[] = input.days.map((day) => {
    const s = new Set<string>();
    for (const stop of day.stops) {
      const poi = input.poisById[stop.poiId];
      if (!poi) continue;
      for (const v of poi.vibeTags) s.add(v);
    }
    return s;
  });
  for (let i = 0; i < dayVibes.length; i++) {
    for (let j = i + 1; j < dayVibes.length; j++) {
      const a = dayVibes[i]!;
      const b = dayVibes[j]!;
      const inter = [...a].filter((v) => b.has(v)).length;
      const union = new Set([...a, ...b]).size || 1;
      if (inter / union > 0.7 && union > 2) {
        dayWarnings.push({ dayIndex: input.days[j]!.dayIndex, code: "REPEAT_VIBE" });
      }
    }
  }

  return { stopWarnings, dayWarnings };
}
