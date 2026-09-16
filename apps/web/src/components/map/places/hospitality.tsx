// Drawn scenes for places you sit down in — restaurant, cafe, bar.
// Ground line at y=0, centred on x=0.

function StringLights() {
  return (
    <g>
      <path d="M-26 -34 q13 9 26 0 q13 -9 26 0" fill="none" stroke="var(--l-brass)" strokeWidth={1} />
      <circle cx={-15} cy={-30.5} r={1.9} fill="var(--l-map-lamp)" />
      <circle cx={0} cy={-34} r={1.9} fill="var(--l-map-lamp)" />
      <circle cx={15} cy={-30.5} r={1.9} fill="var(--l-map-lamp)" />
    </g>
  );
}

export function RestaurantScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={28} ry={6} fill="var(--l-map-beach)" />
      <StringLights />
      <rect x={-16} y={-16} width={32} height={16} fill="var(--l-map-wall)" />
      <path d="M-22 -16 L0 -29 L22 -16 Z" fill="var(--l-map-roof)" />
      <path d="M-22 -16 L0 -29 L22 -16" fill="none" stroke="var(--l-map-roof-ink)" strokeWidth={1} strokeLinejoin="round" />
      <rect x={-4} y={-10} width={9} height={10} rx={1} fill="var(--l-brass-deep)" />
      <circle cx={-23} cy={-4} r={4} fill="var(--l-map-wall)" stroke="var(--l-linen-warm)" strokeWidth={1} />
      <circle cx={23} cy={-4} r={4} fill="var(--l-map-wall)" stroke="var(--l-linen-warm)" strokeWidth={1} />
    </g>
  );
}

export function CafeScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={24} ry={5.5} fill="var(--l-map-beach)" />
      <rect x={-14} y={-15} width={28} height={15} fill="var(--l-map-wall)" />
      <path d="M-19 -15 L-14 -25 L14 -25 L19 -15 Z" fill="var(--l-map-roof)" />
      <rect x={-4} y={-9} width={8} height={9} rx={1} fill="var(--l-brass-deep)" />
      {/* cup on a saucer, out front */}
      <g transform="translate(20,-3)">
        <path d="M-5 -6 h8 v4 a4 4 0 0 1 -8 0 Z" fill="var(--l-map-wall)" stroke="var(--l-linen-warm)" strokeWidth={1} />
        <path d="M3 -5 a2.4 2.4 0 0 1 0 3.4" fill="none" stroke="var(--l-linen-warm)" strokeWidth={1} />
        <path d="M-6.5 0 h11" stroke="var(--l-brass-deep)" strokeWidth={1.4} strokeLinecap="round" />
        <path d="M-2 -9 q1.5 -2 0 -4 M1 -9 q1.5 -2 0 -4" stroke="var(--l-linen-warm)" strokeWidth={1} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function BarScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={26} ry={6} fill="var(--l-map-beach)" />
      <rect x={-16} y={-14} width={32} height={14} fill="var(--l-map-wall)" />
      <path d="M-21 -14 L-16 -26 L16 -26 L21 -14 Z" fill="var(--l-forest)" />
      <path
        d="M-14.5 -14 L-10 -26 M-5.5 -14 L-1 -26 M3.5 -14 L8 -26 M12.5 -14 L17 -26"
        stroke="var(--l-map-wall)"
        strokeWidth={3}
        opacity={0.28}
      />
      {/* hanging lantern */}
      <path d="M0 -26 L0 -33" stroke="var(--l-brass-deep)" strokeWidth={1.2} />
      <circle cx={0} cy={-35} r={3.2} fill="var(--l-map-lamp)" />
      {/* two stools */}
      <g stroke="var(--l-brass-deep)" strokeWidth={1.6} strokeLinecap="round" fill="none">
        <path d="M-22 0 v-6 M-25 -6 h6" />
        <path d="M22 0 v-6 M19 -6 h6" />
      </g>
    </g>
  );
}

export function PavilionScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={24} ry={5.5} fill="var(--l-map-land)" />
      <rect x={-14} y={-14} width={28} height={14} fill="var(--l-map-wall)" />
      <path d="M-20 -14 L0 -26 L20 -14 Z" fill="var(--l-map-roof)" />
      <rect x={-4} y={-9} width={8} height={9} rx={1} fill="var(--l-brass-deep)" />
    </g>
  );
}
