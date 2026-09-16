import styles from "../map.module.css";
import { Palm } from "../artwork/Palm";

// Drawn scenes for the outdoor categories. Each is centred on x=0 with its
// ground line at y=0, so the map can drop it straight onto a projected point.

export function BeachScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={31} ry={7} fill="var(--l-map-beach)" />
      <path d="M-18 0 L-18 -11 L-3 -11 L-3 0 Z" fill="var(--l-map-wall)" />
      <path d="M-24 -11 L-10.5 -24 L3 -11 Z" fill="var(--l-map-roof)" />
      <path d="M-24 -11 L-10.5 -24 L3 -11" fill="none" stroke="var(--l-map-roof-ink)" strokeWidth={1} />
      <rect x={-13} y={-7} width={5} height={7} fill="var(--l-brass-deep)" />
      <g transform="translate(14,0)">
        <Palm />
      </g>
      <ellipse cx={-27} cy={-5} rx={3} ry={9.5} fill="var(--l-map-sail)" transform="rotate(-20 -27 -5)" />
    </g>
  );
}

export function SunsetScene() {
  return (
    <g>
      <circle cx={2} cy={-26} r={11} fill="var(--l-map-lamp)" />
      <g stroke="var(--l-map-lamp)" strokeWidth={1.6} strokeLinecap="round" opacity={0.9}>
        <path d="M2 -43 v-5 M-13 -26 h-5 M17 -26 h5 M-9 -37 l-3.5 -3.5 M13 -37 l3.5 -3.5" />
      </g>
      <path d="M-26 0 C-18 -10 -8 -16 2 -16 C12 -16 22 -9 28 0 Z" fill="var(--l-map-rock)" />
      <path d="M-14 0 C-9 -7 -2 -10 4 -10" fill="none" stroke="var(--l-map-trunk)" strokeWidth={1.2} opacity={0.5} />
      <g transform="translate(-24,1)">
        <Palm scale={0.7} delay={0.5} />
      </g>
    </g>
  );
}

export function WatersportScene() {
  return (
    <g>
      <g className={styles.bob} style={{ animationDelay: "0.3s" }}>
        <path d="M-22 -4 q22 12 44 0 q-22 6 -44 0 Z" fill="var(--l-map-wall)" />
        <path d="M-22 -4 q22 12 44 0" fill="none" stroke="var(--l-linen-warm)" strokeWidth={1} />
        <circle cx={0} cy={-13} r={5} fill="var(--l-brass-deep)" />
        <path d="M-14 -22 L16 -8" stroke="var(--l-map-trunk)" strokeWidth={2} strokeLinecap="round" />
        <path d="M-14 -22 l-6 -2 l2 6 Z" fill="var(--l-map-roof)" />
      </g>
      <path
        d="M-32 4 q9 -4 16 0 M16 5 q9 -4 16 0"
        stroke="var(--l-ivory)"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );
}

export function SailScene() {
  return (
    <g>
      <g className={styles.bob} style={{ animationDelay: "0.6s" }}>
        <path d="M-21 0 q21 11 42 0 Z" fill="var(--l-map-wall)" />
        <path d="M-21 0 q21 11 42 0" fill="none" stroke="var(--l-linen-warm)" strokeWidth={1} />
        <path d="M0 -2 L0 -32" stroke="var(--l-brass-deep)" strokeWidth={2.1} strokeLinecap="round" />
        <path d="M2.5 -30 L21 -6 L2.5 -6 Z" fill="var(--l-map-roof)" />
        <path d="M-2.5 -25 L-15 -6 L-2.5 -6 Z" fill="var(--l-map-sail)" />
      </g>
      <path
        d="M-32 6 q9 -4 16 0 M18 7 q9 -4 16 0"
        stroke="var(--l-ivory)"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );
}

export function DayTripScene() {
  return (
    <g>
      <path d="M-30 0 C-22 -18 -10 -30 0 -30 C10 -30 22 -18 30 0 Z" fill="var(--l-map-ghat)" />
      <path d="M-14 0 C-8 -14 0 -24 6 -24 C12 -24 18 -14 22 0 Z" fill="var(--l-map-grove)" opacity={0.7} />
      <path
        d="M2 -24 C1 -16 3 -8 2 0"
        stroke="var(--l-ivory)"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        opacity={0.92}
      />
      <path
        d="M-6 1 q8 -4 16 0"
        stroke="var(--l-sea-light)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(-26,1)">
        <Palm scale={0.62} delay={1.1} />
      </g>
    </g>
  );
}
