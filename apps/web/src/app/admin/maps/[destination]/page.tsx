import type { MapAnchor } from "@lohono/shared-types";
import { AnchorEditor } from "./AnchorEditor";
import transform from "../../../../../public/maps/goa/v1/transform.json";

export default async function AnchorAdminPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Anchors · {destination}</h1>
      <p className="text-sm text-ink/60">
        Click a point on the artwork, then enter its lat/lng. Fit error is recomputed live.
      </p>
      <AnchorEditor
        imageUrl="/maps/goa/v1/artwork.svg"
        width={transform.width}
        height={transform.height}
        initialAnchors={transform.anchors as MapAnchor[]}
      />
    </div>
  );
}
