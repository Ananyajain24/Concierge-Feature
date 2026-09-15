import type { MapAnchor } from "@lohono/shared-types";
import { LazyMap } from "./LazyMap";
import { DEV_PINS, DEV_ROUTES, DEV_VILLA } from "./fixtures";
import transform from "../../../../public/maps/goa/v1/transform.json";

const ART = "/maps/goa/v1/artwork.svg";

export default function DevMapPage() {
  const anchors = transform.anchors as MapAnchor[];
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <link rel="preload" as="image" href={ART} fetchPriority="high" />
      <h1 className="mb-2 font-display text-2xl">Map sandbox</h1>
      <p className="mb-6 text-sm text-ink/60">
        {DEV_PINS.length} hardcoded pins across {new Set(DEV_PINS.map((p) => p.dayIndex)).size} days.
      </p>
      <LazyMap
        imageUrl={ART}
        width={transform.width}
        height={transform.height}
        anchors={anchors}
        villa={DEV_VILLA}
        pins={DEV_PINS}
        routes={DEV_ROUTES}
      />
    </main>
  );
}
