const R_EARTH_M = 6_371_000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Convert straight-line meters into an estimated drive-time seconds.
// 35 km/h average with a 1.35 road-detour factor is our MVP default.
export interface DriveEstimateOpts {
  detourFactor?: number;
  avgKmh?: number;
}

export function estimateDriveSeconds(
  meters: number,
  opts: DriveEstimateOpts = {},
): number {
  const detour = opts.detourFactor ?? 1.35;
  const kmh = opts.avgKmh ?? 35;
  const roadMeters = meters * detour;
  return Math.round((roadMeters / 1000 / kmh) * 3600);
}

export function estimateDriveMeters(
  meters: number,
  opts: DriveEstimateOpts = {},
): number {
  const detour = opts.detourFactor ?? 1.35;
  return Math.round(meters * detour);
}
