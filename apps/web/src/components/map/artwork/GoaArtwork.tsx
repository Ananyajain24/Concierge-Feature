import styles from "../map.module.css";
import { Palm } from "./Palm";

// The illustrated backdrop for Goa, drawn in the 1000x620 space that
// public/maps/goa/v2/transform.json is anchored against. It carries no text —
// every label lives in the overlay above it (architecture rule 5).
//
// The coastline is drawn west of every projected coastal anchor, so a beach
// POI always lands on sand.
export function GoaArtwork() {
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id="goa-sea" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="var(--l-sea-light)" />
          <stop offset="1" stopColor="var(--l-sea-deep)" />
        </linearGradient>
      </defs>

      <rect width={1000} height={620} fill="url(#goa-sea)" />

      {/* landmass: coastal sand, then inland, then the ghats */}
      <path
        d="M248 0 C236 52 276 76 268 108 C258 146 322 152 316 186 C308 224 330 244 322 278
           C314 316 358 336 352 372 C346 412 378 440 372 476 C366 516 392 546 386 584
           L386 620 L1000 620 L1000 0 Z"
        fill="var(--l-map-sand)"
      />
      <path
        d="M286 0 C274 52 314 76 306 108 C296 146 360 152 354 186 C346 224 368 244 360 278
           C352 316 396 336 390 372 C384 412 416 440 410 476 C404 516 430 546 424 584
           L424 620 L1000 620 L1000 0 Z"
        fill="var(--l-map-land)"
      />
      <path d="M620 0 C672 86 742 148 830 196 C892 230 950 250 1000 258 L1000 0 Z" fill="var(--l-map-ghat)" />
      <path d="M700 620 C760 566 840 526 1000 492 L1000 620 Z" fill="var(--l-map-ghat)" />

      {/* rivers — Chapora, Mandovi, Zuari */}
      <path
        d="M316 198 C380 186 440 206 512 194 C566 184 616 198 664 190"
        stroke="var(--l-sea-light)"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M380 404 C460 392 500 398 560 388 C640 376 700 380 780 372"
        stroke="var(--l-sea-light)"
        strokeWidth={16}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M400 520 C480 508 540 526 620 512 C690 500 750 512 810 500"
        stroke="var(--l-sea-light)"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M314 190 L294 198 L314 208 Z" fill="var(--l-sea-light)" />
      <path d="M378 392 L352 404 L378 418 Z" fill="var(--l-sea-light)" />

      {/* swell */}
      <g
        className={styles.shine}
        stroke="var(--l-ivory)"
        strokeOpacity={0.5}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      >
        <path d="M58 120 q11 -7 22 0 t22 0" />
        <path d="M132 246 q11 -7 22 0 t22 0" />
        <path d="M44 352 q11 -7 22 0 t22 0" />
        <path d="M148 454 q11 -7 22 0 t22 0" />
        <path d="M68 548 q11 -7 22 0 t22 0" />
        <path d="M182 92 q11 -7 22 0 t22 0" />
        <path d="M100 298 q11 -7 22 0 t22 0" />
      </g>

      {/* fishing boats */}
      <g className={styles.bob} transform="translate(176,320)">
        <path d="M-14 0 q14 8 28 0 Z" fill="var(--l-map-wall)" />
        <path d="M0 -1 L0 -18 L11 -5 Z" fill="var(--l-map-roof)" />
      </g>
      <g className={styles.bob} style={{ animationDelay: "1.4s" }} transform="translate(104,478)">
        <path d="M-11 0 q11 6 22 0 Z" fill="var(--l-map-wall)" />
        <path d="M0 -1 L0 -14 L9 -4 Z" fill="var(--l-map-sail)" />
      </g>

      {/* birds */}
      <g stroke="var(--l-ivory)" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8}>
        <path d="M206 168 q5 -4 10 0 q5 -4 10 0" />
        <path d="M232 152 q4 -3 8 0 q4 -3 8 0" />
      </g>

      {/* coastal palms */}
      <g transform="translate(300,300)">
        <Palm />
      </g>
      <g transform="translate(340,500)">
        <Palm delay={0.8} />
      </g>
      <g transform="translate(360,568)">
        <Palm scale={0.85} delay={2.1} />
      </g>
      <g transform="translate(286,118)">
        <Palm scale={0.8} delay={1.3} />
      </g>

      {/* groves and paddy */}
      <g opacity={0.75} fill="var(--l-map-grove)">
        <ellipse cx={600} cy={128} rx={26} ry={12} />
        <ellipse cx={636} cy={144} rx={18} ry={9} />
        <ellipse cx={560} cy={470} rx={30} ry={13} />
        <ellipse cx={824} cy={306} rx={34} ry={14} />
        <ellipse cx={870} cy={326} rx={22} ry={10} />
        <ellipse cx={486} cy={572} rx={26} ry={11} />
      </g>
      <g stroke="var(--l-map-ghat)" strokeWidth={1.6} fill="none" opacity={0.8}>
        <path d="M708 468 q18 -6 36 0 M708 480 q18 -6 36 0 M708 492 q18 -6 36 0" />
        <path d="M520 104 q16 -5 32 0 M520 114 q16 -5 32 0" />
      </g>
    </g>
  );
}
