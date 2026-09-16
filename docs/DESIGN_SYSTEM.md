# Lohono Concierge — Design System

Single source of truth for the visual layer. Every colour, radius and type size in
`apps/web` must come from here via CSS custom properties. No hardcoded hex.

> **Palette note.** Lohono Stays' identity is ivory ground, near-black ink, a warm brass
> accent and a deep forest for dark surfaces, with luxury-hospitality whitespace and a
> serif display face. The tokens below are matched to that. They live in one file so that
> if brand hands over exact hexes, it is a one-file change and nothing else moves.

---

## 1. Colour tokens

`apps/web/src/lib/tokens.css`

```css
:root {
  /* Ground */
  --l-ivory:      #FBF9F5;   /* page background */
  --l-sand:       #F2EBE0;   /* cards, muted panels */
  --l-linen:      #E4DACA;   /* hairline borders, dividers */

  /* Ink */
  --l-ink:        #1B1A17;   /* headings, body */
  --l-graphite:   #4F4B44;   /* secondary text */
  --l-muted:      #8A8377;   /* captions, meta, disabled */

  /* Brand accent */
  --l-brass:      #B08D57;   /* rules, icons, active states, map routes */
  --l-brass-deep: #8A6B3A;   /* CTA fill — white text passes AA */
  --l-brass-wash: #F6EFE2;   /* selected chip background */

  /* Dark surface */
  --l-forest:     #24352D;   /* footer, admin sidebar, hero scrim */
  --l-sage:       #7E9080;   /* success, "published" */

  /* Signals */
  --l-terracotta: #C1663F;   /* warnings — never red, never alarming */
  --l-amber:      #C8973E;   /* SLA 4–12h */
  --l-crimson:    #A33A2B;   /* SLA breached */

  /* Map */
  --l-sea:        #9DC4CE;   /* water behind the artwork box */
  --l-map-route:  #B08D57;
  --l-map-pin:    #24352D;
  --l-map-villa:  #8A6B3A;
}
```

Usage rules:

- Body text is always `--l-ink` on `--l-ivory`. Brass is never body text — contrast fails.
- One accent per screen. If a page already has a brass CTA, secondary actions are outline
  `--l-linen` with `--l-ink` text.
- Warnings use `--l-terracotta` on `--l-brass-wash`. They are advisory, so they never get a
  red alert treatment.
- Dark sections (`--l-forest`) invert: text `--l-ivory`, accent `--l-brass`.

---

## 2. Typography

```css
--font-display: "Cormorant Garamond", Georgia, "Times New Roman", serif;
--font-body:    "Jost", system-ui, -apple-system, "Segoe UI", sans-serif;
```

| Role | Size / line | Weight | Face | Tracking |
|---|---|---|---|---|
| Hero | 44 / 48 (mobile 32 / 36) | 400 | display | -0.01em |
| Page head | 34 / 38 | 400 | display | -0.01em |
| Day theme | 27 / 32 | 400 | display | 0 |
| Panel head | 25 / 30 | 400 | display | 0 |
| H3 / card title | 17 / 24 | 600 | body | 0 |
| Body | 15 / 24 | 400 | body | 0 |
| Meta / caption | 13 / 18 | 500 | body | 0.01em |
| Eyebrow | 11 / 14 | 600 | body | 0.14em, uppercase |

Display face is used for headings and the itinerary day themes only. Everything
functional — buttons, labels, tables, forms — is body sans.

---

## 3. Shape, space, elevation

```css
--r-sm: 6px;    /* chips, inputs */
--r-md: 12px;   /* cards */
--r-lg: 20px;   /* map frame, sheets */
--r-pill: 999px;

--space: 4px;   /* scale: 4 8 12 16 24 32 48 64 96 */

--shadow-card:  0 1px 2px rgba(27,26,23,.04), 0 8px 24px rgba(27,26,23,.06);
--shadow-sheet: 0 -8px 40px rgba(27,26,23,.14);
--border:       1px solid var(--l-linen);
```

Elevation is used sparingly: cards get `--shadow-card`, the swap sheet gets
`--shadow-sheet`, nothing else floats. Separation comes from hairlines and whitespace, not
from shadow.

---

## 4. Components

| Component | Spec |
|---|---|
| `Button` | primary = `--l-brass-deep` fill, ivory text, `--r-pill`, 44px tall, 24px side padding. secondary = transparent, `--border`, ink text. ghost = ink text only, brass underline on hover. |
| `Chip` | `--r-pill`, 36px tall, `--border`. Selected = `--l-brass-wash` fill, `--l-brass` border, ink text, small check. |
| `Card` | `--l-ivory` on `--l-sand` page, or vice versa, `--r-md`, `--border`, `--shadow-card`, 20px padding. |
| `StopCard` | 96px thumb left, title + slot eyebrow + 40-word copy, drive chip, warning strip, CTA row. |
| `WarningBanner` | `--l-brass-wash` ground, 3px left rule in `--l-terracotta`, 13px text, dismiss X. |
| `Sheet` | bottom sheet on mobile, right drawer at 768px+, `--r-lg` top corners, `--shadow-sheet`, drag handle. |
| `Field` | 44px, `--r-sm`, `--border`, focus ring 2px `--l-brass` at 40% opacity. |
| `SlaPill` | green `--l-sage` above 12h, `--l-amber` 4–12h, `--l-crimson` under 4h, `--l-ink` breached. |
| `DayFilter` | pill row over the map, active = brass fill. |

Motion: 200ms `cubic-bezier(.2,.8,.2,1)` for entrances, 120ms linear for hovers. Only
`transform` and `opacity`. Everything respects `prefers-reduced-motion`.

---

## 5. Screens

1. **Villa page entry** — a concierge card under the villa fold: "Your trip, planned."
   Shows what the guest gets, single CTA into the questionnaire.
2. **Questionnaire** — 6 steps, one question per screen, progress dots, large tap targets,
   back always available, answers saved per step so the token can resume.
3. **Crafting state** — after submit: what is happening now, the 24h SLA promise, and a
   preview of the map artwork greyed back. Polls the job.
4. **Guest itinerary** — hero (villa, dates, guest name, summary), then the illustrated map
   (sticky on mobile), then day-by-day timeline of `StopCard`s, then the booking rail.
5. **Swap drawer** — alternates for one slot, each with the reason it fits, and the warning
   that appears if the swap costs coverage.
6. **Admin review queue** — SLA burn-down table.
7. **Admin review detail** — three panes: map, day editor, alternates. Reason-code picker
   fires on every save.
8. **Admin insights** — reason-code frequency, SLA compliance, lead clicks.

---

## 6. Map visual language

- Artwork: flat illustration, warm sand landmass, `--l-sea` water, no text anywhere.
- **One map per trip, not per day.** Every stop on the trip sits on a single sheet; there is no
  day filter and no chained route. The organising idea is the villa at the centre and everything
  measured from it.
- Villa: a drawn house in terracotta and ivory with a small pool and palm, under a brass ribbon
  carrying the villa name. It is the only labelled-in-brass object on the map.
- Stops: each POI is its own **small drawn scene** in the same flat, hand-illustrated style —
  a thatched hut and palms for a beach, a crenellated fort with a flag, a striped market stall,
  a sailboat, a lit restaurant terrace, a twin-towered basilica. Never a generic pin. Add a new
  drawing per POI category; reuse across POIs of that category.
- **Dotted connectors**: 2.4px brass (`#A9803F`), `stroke-dasharray: 1 7`, rounded caps, a gentle
  quadratic bow. One per stop, all radiating from under the villa. They never chain stop to stop.
- **Distance on the line**: an ivory pill at roughly the midpoint of each connector reading
  `21.4 km · 41 min`, 10.5px body in brass-deep. This is the map's whole job — every number on it
  is a drive from the villa.
- Place names: display serif 17px in ink, set on the outward side of each drawing, with a 3.5px
  ground-coloured `paint-order: stroke` halo so they stay legible over the artwork.
- Idle motion: palms sway, boats bob, the fort flag flutters — 3–6s loops, 2–3px amplitude.
  Entry: drawings rise in, then each dotted line draws outward from the villa via an animated
  mask, then the distance pill fades.
- Selecting a place dims the others to 32% and opens a small card; there is no other map state.
- The map frame is `--r-lg` with a 1px `--l-linen` border and a `--l-sea` ground so the
  LQIP blur never flashes white.
