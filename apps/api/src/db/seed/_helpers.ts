import type { OpeningHours, Seasonality } from "@lohono/shared-types";

// Standard hours variants — keep this small so seeds stay legible.
const openFor = (open: string, close: string): OpeningHours[keyof OpeningHours] => ({
  open,
  close,
  closed: false,
});
const closed: OpeningHours[keyof OpeningHours] = { open: null, close: null, closed: true };

export const hours = {
  everyday: (open = "08:00", close = "22:00"): OpeningHours => ({
    mon: openFor(open, close),
    tue: openFor(open, close),
    wed: openFor(open, close),
    thu: openFor(open, close),
    fri: openFor(open, close),
    sat: openFor(open, close),
    sun: openFor(open, close),
  }),
  closedOn: (day: keyof OpeningHours, open = "10:00", close = "22:00"): OpeningHours => {
    const h = hours.everyday(open, close);
    h[day] = closed;
    return h;
  },
  beach: (): OpeningHours => hours.everyday("06:00", "20:00"),
  restaurant: (day?: keyof OpeningHours): OpeningHours =>
    day ? hours.closedOn(day, "12:00", "23:00") : hours.everyday("12:00", "23:00"),
  bar: (): OpeningHours => hours.everyday("17:00", "01:00"),
  heritage: (): OpeningHours => hours.closedOn("mon", "09:30", "17:30"),
  market: (): OpeningHours => hours.closedOn("sun", "09:00", "20:00"),
  cafe: (): OpeningHours => hours.everyday("07:30", "22:00"),
  spa: (): OpeningHours => hours.everyday("09:00", "21:00"),
};

// Monsoon June-September is uncomfortable in Goa for outdoor stops.
export const monsoonOff: Seasonality = {
  best_months: [10, 11, 12, 1, 2, 3],
  avoid_months: [6, 7, 8, 9],
  note: "Monsoon in Goa runs June–September.",
};

export const yearRound: Seasonality = {
  best_months: [10, 11, 12, 1, 2, 3, 4],
  avoid_months: [],
};
