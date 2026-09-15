import type { MapPin, MapRoute } from "@/components/map/types";

export const DEV_VILLA: MapPin = {
  id: "villa-amarante",
  lat: 15.6291,
  lng: 73.7378,
  category: "villa",
  label: "Villa Amarante",
  isVilla: true,
};

export const DEV_PINS: MapPin[] = [
  { id: "p1", lat: 15.6432, lng: 73.7361, category: "beach",       label: "Ashwem Beach",     dayIndex: 0, order: 0 },
  { id: "p2", lat: 15.5893, lng: 73.7530, category: "cafe",        label: "Baba Au Rhum",     dayIndex: 0, order: 1 },
  { id: "p3", lat: 15.6055, lng: 73.7350, category: "heritage",    label: "Chapora Fort",     dayIndex: 0, order: 2 },
  { id: "p4", lat: 15.5942, lng: 73.7370, category: "bar",         label: "Antares",          dayIndex: 0, order: 3 },

  { id: "p5", lat: 15.6874, lng: 73.7031, category: "beach",       label: "Arambol Beach",    dayIndex: 1, order: 0 },
  { id: "p6", lat: 15.6613, lng: 73.7222, category: "beach",       label: "Mandrem Beach",    dayIndex: 1, order: 1 },
  { id: "p7", lat: 15.5966, lng: 73.7514, category: "restaurant",  label: "Gunpowder",        dayIndex: 1, order: 2 },

  { id: "p8", lat: 15.5751, lng: 73.7385, category: "market",      label: "Anjuna Market",    dayIndex: 2, order: 0 },
  { id: "p9", lat: 15.4972, lng: 73.7681, category: "sunset_point",label: "Sinquerim Deck",   dayIndex: 2, order: 1 },
  { id: "p10", lat: 15.5462, lng: 73.7602, category: "restaurant", label: "A Reverie",        dayIndex: 2, order: 2 },
];

function link(a: MapPin, b: MapPin): MapRoute {
  return {
    id: `${a.id}-${b.id}`,
    dayIndex: b.dayIndex!,
    from: a,
    to: b,
    driveMin: 15,
    driveKm: 6,
  };
}

const byDay = (d: number) =>
  DEV_PINS.filter((p) => p.dayIndex === d).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

function chainWithVilla(): MapRoute[] {
  const routes: MapRoute[] = [];
  for (let d = 0; d < 3; d++) {
    const chain = [DEV_VILLA, ...byDay(d), DEV_VILLA];
    for (let i = 0; i < chain.length - 1; i++) {
      routes.push({ ...link(chain[i]!, chain[i + 1]!), dayIndex: d });
    }
  }
  return routes;
}

export const DEV_ROUTES: MapRoute[] = chainWithVilla();
