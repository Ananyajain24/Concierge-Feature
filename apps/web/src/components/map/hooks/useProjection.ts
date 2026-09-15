"use client";

import { useMemo } from "react";
import { fitAffine, project, type AffineMatrix } from "@lohono/map-projection";
import type { MapAnchor } from "@lohono/shared-types";

export function useProjection(anchors: MapAnchor[]) {
  const matrix = useMemo<AffineMatrix | null>(() => {
    if (anchors.length < 3) return null;
    return fitAffine(anchors);
  }, [anchors]);

  return useMemo(() => {
    if (!matrix) return () => ({ x: 0, y: 0 });
    return (lat: number, lng: number) => project(matrix, lat, lng);
  }, [matrix]);
}
