import type { MapAnchor } from "@lohono/shared-types";

export interface MapStop {
  id: string;
  lat: number;
  lng: number;
  category: string;
  name: string;
  dayIndex: number;
  order: number;
  /** Drive from the villa, not from the previous stop — the map measures spokes. */
  driveSec: number;
  driveMeters: number;
}

export interface MapVilla {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

export interface MapAssetInfo {
  imageUrl: string;
  width: number;
  height: number;
  anchors: MapAnchor[];
}

export interface MapViewport {
  scale: number;
  tx: number;
  ty: number;
}
