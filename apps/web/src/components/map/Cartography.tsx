// Everything on the map that is map-furniture rather than trip data:
// the sea and range labels, the compass rose, and the double border.
// Kept out of the artwork so the artwork itself stays text-free.
export function Cartography() {
  return (
    <g aria-hidden>
      <text
        x={112}
        y={186}
        fontSize={17}
        letterSpacing={4.5}
        fill="var(--l-ivory)"
        opacity={0.85}
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        ARABIAN SEA
      </text>
      <text
        x={764}
        y={92}
        fontSize={14}
        letterSpacing={3.5}
        fill="var(--l-sage-ink)"
        opacity={0.75}
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        WESTERN GHATS
      </text>

      <g transform="translate(104,536)" opacity={0.92}>
        <circle r={26} fill="none" stroke="var(--l-ivory)" strokeWidth={1.4} />
        <circle r={19} fill="none" stroke="var(--l-ivory)" strokeWidth={0.8} opacity={0.6} />
        <path d="M-24 0 L0 -4 L24 0 L0 4 Z" fill="var(--l-ivory)" opacity={0.55} />
        <path d="M0 -24 L5 0 L0 24 L-5 0 Z" fill="var(--l-ivory)" />
        <path d="M0 -24 L5 0 L0 0 Z" fill="var(--l-map-roof)" />
        <text
          x={0}
          y={-31}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="var(--l-ivory)"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          N
        </text>
      </g>

      <rect x={9} y={9} width={982} height={602} fill="none" stroke="var(--l-brass)" strokeWidth={2.5} />
      <rect x={17} y={17} width={966} height={586} fill="none" stroke="var(--l-brass)" strokeWidth={0.9} opacity={0.55} />
    </g>
  );
}
