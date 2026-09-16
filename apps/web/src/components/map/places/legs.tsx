// Drawn "pictures" for the two services Lohono arranges itself rather than a
// POI in the catalog — an airport transfer and a scooter rental. Same flat,
// hand-illustrated style as the map's place scenes, centred on x=0, ground
// line at y=0, so they can share a frame with StopThumb-style thumbnails.

export function TransferScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={34} ry={7} fill="var(--l-map-land)" />
      <rect x={-30} y={-16} width={60} height={16} rx={3} fill="var(--l-map-wall)" />
      <path d="M-30 -16 L-22 -30 L22 -30 L30 -16 Z" fill="var(--l-brass-deep)" />
      <rect x={-18} y={-27} width={14} height={9} rx={1} fill="var(--l-sea)" />
      <rect x={4} y={-27} width={14} height={9} rx={1} fill="var(--l-sea)" />
      <circle cx={-18} cy={-2} r={7} fill="var(--l-ink)" />
      <circle cx={-18} cy={-2} r={3} fill="var(--l-map-wall)" />
      <circle cx={18} cy={-2} r={7} fill="var(--l-ink)" />
      <circle cx={18} cy={-2} r={3} fill="var(--l-map-wall)" />
      <rect x={26} y={-14} width={5} height={4} rx={1} fill="var(--l-map-lamp)" />
    </g>
  );
}

export function ScooterScene() {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={30} ry={6} fill="var(--l-map-land)" />
      <path d="M-20 -2 q-4 -14 6 -16" fill="none" stroke="var(--l-ink)" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M-14 -18 h12" stroke="var(--l-brass-deep)" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M8 -18 L22 -4" stroke="var(--l-ink)" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <rect x={14} y={-10} width={12} height={7} rx={2} fill="var(--l-brass)" />
      <circle cx={-18} cy={0} r={7} fill="var(--l-ink)" />
      <circle cx={-18} cy={0} r={3} fill="var(--l-map-wall)" />
      <circle cx={20} cy={0} r={7} fill="var(--l-ink)" />
      <circle cx={20} cy={0} r={3} fill="var(--l-map-wall)" />
    </g>
  );
}
