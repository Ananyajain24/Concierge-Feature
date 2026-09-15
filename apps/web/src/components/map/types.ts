import type { MapAnchor } from "@lohono/shared-types";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  category: string;
  label?: string;
  dayIndex?: number;
  order?: number;
  isVilla?: boolean;
}

export interface MapRoute {
  id: string;
  dayIndex: number;
  from: MapPin;
  to: MapPin;
  driveMin: number;
  driveKm: number;
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
