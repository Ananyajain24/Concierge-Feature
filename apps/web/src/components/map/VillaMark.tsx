import styles from "./map.module.css";
import { Palm } from "./artwork/Palm";

// The villa is the only object on the map that carries a brass ribbon — it is
// the thing every distance is measured from.
export const VILLA_RADIUS = 44;

export function VillaMark({ x, y, name }: { x: number; y: number; name: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <g className={styles.place} style={{ animationDelay: "0.1s" }}>
        <ellipse cx={0} cy={3} rx={42} ry={9} fill="var(--l-map-beach)" />
        <rect x={-38} y={-9} width={17} height={9} rx={3.5} fill="var(--l-map-pool)" />
        <path d="M-35 -6.5 h11 M-35 -3 h11" stroke="var(--l-sea)" strokeWidth={1} />
        <rect x={-17} y={-26} width={34} height={26} fill="var(--l-map-wall)" />
        <path d="M-23 -26 L0 -43 L23 -26 Z" fill="var(--l-map-roof)" />
        <path
          d="M-23 -26 L0 -43 L23 -26"
          fill="none"
          stroke="var(--l-map-roof-ink)"
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <rect x={-5} y={-13} width={10} height={13} rx={1} fill="var(--l-brass-deep)" />
        <rect x={-14} y={-21} width={7} height={6} fill="var(--l-sea)" />
        <rect x={7} y={-21} width={7} height={6} fill="var(--l-sea)" />
        <g transform="translate(26,0)">
          <Palm delay={0.3} />
        </g>
      </g>

      <g className={styles.lab} style={{ animationDelay: "0.34s" }}>
        <rect x={-58} y={7} width={116} height={19} rx={9.5} fill="var(--l-brass-deep)" />
        <text
          x={0}
          y={20.5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          letterSpacing={1.4}
          fill="var(--l-ivory)"
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          {name.toUpperCase().slice(0, 18)}
        </text>
      </g>
    </g>
  );
}
