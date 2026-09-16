import { PlaceScene } from "@/components/map/places";

// The day list reuses the map's drawn scenes as card thumbnails, so a stop
// looks the same in the list as it does on the map. No photography needed.
const GROUND: Record<string, string> = {
  beach: "var(--l-sea-light)",
  watersport: "var(--l-sea-light)",
  sunset_point: "var(--l-sea-light)",
  day_trip: "var(--l-map-land)",
  heritage: "var(--l-sand)",
  market: "var(--l-sand)",
  spa: "var(--l-sage-tint)",
  bar: "var(--l-forest)",
  restaurant: "var(--l-map-beach)",
  cafe: "var(--l-map-beach)",
};

export function StopThumb({
  category,
  name,
  uid,
  size = 92,
}: {
  category: string;
  name: string;
  uid: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92 92"
      className="shrink-0 rounded-md"
      role="img"
      aria-label={name}
    >
      <rect width={92} height={92} fill={GROUND[category] ?? "var(--l-sand)"} />
      {(category === "beach" || category === "watersport" || category === "sunset_point") && (
        <path d="M0 62 C 24 54 44 66 68 58 C 80 54 88 58 92 56 L92 92 L0 92 Z" fill="var(--l-map-sand)" />
      )}
      <g transform="translate(46,72) scale(0.8)">
        <PlaceScene category={category} name={name} uid={`t-${uid}`} />
      </g>
    </svg>
  );
}
