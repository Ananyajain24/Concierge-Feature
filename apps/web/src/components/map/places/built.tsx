import styles from "../map.module.css";

// Drawn scenes for the built categories — fort, church, market stall, spa
// pavilion. Ground line at y=0, centred on x=0.

export function FortScene() {
  return (
    <g>
      <path d="M-27 0 C-19 -9 -10 -12 0 -12 C10 -12 19 -9 27 0 Z" fill="var(--l-map-rock)" />
      <path
        d="M-17 -12 L-17 -24 L-13 -24 L-13 -28 L-9 -28 L-9 -24 L-4 -24 L-4 -28 L0 -28 L0 -24
           L5 -24 L5 -28 L9 -28 L9 -24 L13 -24 L13 -28 L17 -28 L17 -12 Z"
        fill="var(--l-map-stone)"
      />
      <path d="M-17 -12 L17 -12" stroke="var(--l-linen-warm)" strokeWidth={1} />
      <rect x={-3} y={-21} width={6} height={9} rx={1} fill="var(--l-brass-deep)" />
      <path d="M17 -28 L17 -42" stroke="var(--l-brass-deep)" strokeWidth={1.7} strokeLinecap="round" />
      <path className={styles.flutter} d="M17.5 -42 L29 -38.5 L17.5 -35 Z" fill="var(--l-map-roof)" />
    </g>
  );
}

export function ChurchScene() {
  return (
    <g>
      <ellipse cx={0} cy={1} rx={34} ry={7} fill="var(--l-map-land)" />
      <rect x={-28} y={-33} width={11} height={33} fill="var(--l-map-stone)" />
      <path d="M-30 -33 L-22.5 -44 L-15 -33 Z" fill="var(--l-map-roof)" />
      <rect x={17} y={-33} width={11} height={33} fill="var(--l-map-stone)" />
      <path d="M15 -33 L22.5 -44 L30 -33 Z" fill="var(--l-map-roof)" />
      <rect x={-19} y={-24} width={38} height={24} fill="var(--l-map-wall)" />
      <path d="M-24 -24 L0 -40 L24 -24 Z" fill="var(--l-map-roof)" />
      <path d="M-24 -24 L0 -40 L24 -24" fill="none" stroke="var(--l-map-roof-ink)" strokeWidth={1} strokeLinejoin="round" />
      <path d="M-5 0 L-5 -11 a5 5 0 0 1 10 0 L5 0 Z" fill="var(--l-brass-deep)" />
      <circle cx={0} cy={-19} r={3.6} fill="var(--l-brass)" />
      <g stroke="var(--l-brass-deep)" strokeLinecap="round" fill="none">
        <path d="M0 -40 L0 -48 M-3 -45 L3 -45" strokeWidth={1.6} />
        <path d="M-22.5 -44 L-22.5 -49 M-25 -46.8 L-20 -46.8" strokeWidth={1.3} />
        <path d="M22.5 -44 L22.5 -49 M20 -46.8 L25 -46.8" strokeWidth={1.3} />
      </g>
    </g>
  );
}

export function MarketScene({ uid }: { uid: string }) {
  const clip = `awn-${uid}`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d="M-23 -15 L-18 -28 L18 -28 L23 -15 Z" />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={0} rx={27} ry={6} fill="var(--l-map-land)" />
      <rect x={-18} y={-15} width={36} height={15} fill="var(--l-map-wall)" />
      <path d="M-23 -15 L-18 -28 L18 -28 L23 -15 Z" fill="var(--l-map-roof)" />
      <g clipPath={`url(#${clip})`}>
        <path
          d="M-16.5 -15 L-12 -28 M-9 -15 L-4.5 -28 M-1.5 -15 L3 -28 M6 -15 L10.5 -28 M13.5 -15 L18 -28"
          stroke="var(--l-map-wall)"
          strokeWidth={3.4}
        />
      </g>
      <path d="M-24 -28.5 L24 -28.5" stroke="var(--l-brass-deep)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={-10} cy={-6} r={4.2} fill="var(--l-sage)" />
      <circle cx={0} cy={-5} r={4.8} fill="var(--l-amber)" />
      <circle cx={10} cy={-6} r={4.2} fill="var(--l-map-roof)" />
      <path d="M-22 -3 q4 -6 8 0 Z" fill="var(--l-brass-deep)" />
      <path d="M14 -3 q4 -6 8 0 Z" fill="var(--l-brass-deep)" />
    </g>
  );
}

export function SpaScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={28} ry={6} fill="var(--l-map-land)" />
      <rect x={-17} y={-15} width={34} height={15} fill="var(--l-map-wall)" />
      <path d="M-24 -15 L0 -28 L24 -15 Z" fill="var(--l-map-roof)" />
      <path d="M-24 -15 L0 -28 L24 -15" fill="none" stroke="var(--l-map-roof-ink)" strokeWidth={1} strokeLinejoin="round" />
      <path d="M-17 -15 L-17 0 M17 -15 L17 0" stroke="var(--l-brass-deep)" strokeWidth={2} strokeLinecap="round" />
      {/* a single frangipani on the step */}
      <g transform="translate(0,-4)">
        <circle cx={0} cy={0} r={2.4} fill="var(--l-map-lamp)" />
        <g fill="var(--l-map-wall)">
          <ellipse cx={0} cy={-5} rx={2.6} ry={4} />
          <ellipse cx={4.8} cy={-1.5} rx={2.6} ry={4} transform="rotate(72 4.8 -1.5)" />
          <ellipse cx={3} cy={4.2} rx={2.6} ry={4} transform="rotate(144 3 4.2)" />
          <ellipse cx={-3} cy={4.2} rx={2.6} ry={4} transform="rotate(216 -3 4.2)" />
          <ellipse cx={-4.8} cy={-1.5} rx={2.6} ry={4} transform="rotate(288 -4.8 -1.5)" />
        </g>
        <circle cx={0} cy={0} r={2} fill="var(--l-map-lamp)" />
      </g>
    </g>
  );
}
