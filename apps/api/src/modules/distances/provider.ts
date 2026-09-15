import { estimateDriveMeters, estimateDriveSeconds, haversineMeters, type LatLng } from "@lohono/itinerary-engine";

// Provider interface — swap in a real routing API without touching callers.
export interface DistanceProvider {
  name: string;
  compute(a: LatLng, b: LatLng): Promise<{ meters: number; seconds: number }>;
}

export class HaversineDetourProvider implements DistanceProvider {
  name = "haversine-detour-v1";
  constructor(private readonly detourFactor = 1.35, private readonly avgKmh = 35) {}

  async compute(a: LatLng, b: LatLng): Promise<{ meters: number; seconds: number }> {
    const straight = haversineMeters(a, b);
    return {
      meters: estimateDriveMeters(straight, { detourFactor: this.detourFactor }),
      seconds: estimateDriveSeconds(straight, {
        detourFactor: this.detourFactor,
        avgKmh: this.avgKmh,
      }),
    };
  }
}
