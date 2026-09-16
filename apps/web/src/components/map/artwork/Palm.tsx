import styles from "../map.module.css";

// One palm, base at (0,0). Used by the artwork and by the beach scene.
export function Palm({
  scale = 1,
  delay = 0,
  still = false,
}: {
  scale?: number;
  delay?: number;
  still?: boolean;
}) {
  const g = (
    <g transform={scale === 1 ? undefined : `scale(${scale})`}>
      <path
        d="M0 0 C1 -8 2 -14 3 -21"
        stroke="var(--l-map-trunk)"
        strokeWidth={2.3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M3 -21 q-11 -3 -14 5"
        stroke="var(--l-map-frond)"
        strokeWidth={2.7}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M3 -21 q11 -3 13 5"
        stroke="var(--l-map-frond)"
        strokeWidth={2.7}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M3 -21 q-6 -12 -14 -10"
        stroke="var(--l-map-frond-2)"
        strokeWidth={2.7}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M3 -21 q8 -12 15 -9"
        stroke="var(--l-map-frond-2)"
        strokeWidth={2.7}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );

  if (still) return g;
  return (
    <g className={styles.sway} style={{ animationDelay: `${delay}s` }}>
      {g}
    </g>
  );
}
