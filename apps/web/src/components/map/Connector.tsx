import styles from "./map.module.css";
import type { PlacedStop } from "./layout";

// A dotted brass line from the villa to one stop, with the drive on it.
// The dots are revealed through an animated mask so the line appears to travel
// outward from the villa rather than sliding into place.
export function Connector({ placed, delay }: { placed: PlacedStop; delay: number }) {
  const { stop, geom, label, pillAt, pillWidth } = placed;
  const maskId = `conn-${stop.id}`;

  return (
    <g>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={1000} height={620}>
          <path
            d={geom.d}
            stroke="#fff"
            strokeWidth={16}
            fill="none"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100}
            className={styles.reveal}
            style={{ animationDelay: `${delay}s` }}
          />
        </mask>
      </defs>

      <path
        d={geom.d}
        fill="none"
        stroke="var(--l-map-route)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray="1 7"
        mask={`url(#${maskId})`}
      />

      {pillAt && (
      <g
        className={styles.lab}
        style={{ animationDelay: `${delay + 0.75}s` }}
        transform={`translate(${pillAt.x},${pillAt.y})`}
      >
        <rect
          x={-pillWidth / 2}
          y={-9}
          width={pillWidth}
          height={18}
          rx={9}
          fill="var(--l-ivory)"
          opacity={0.95}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight={500}
          fill="var(--l-brass-deep)"
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          {label}
        </text>
      </g>
      )}
    </g>
  );
}
