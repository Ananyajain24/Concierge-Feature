# Lohono Concierge — Build Plan

> Hand this file to Antigravity as the spec. Every section is written so a coding agent
> can execute it without asking follow-up questions.
> Companion docs: `docs/PLAN.md` (original outline), `docs/DESIGN_SYSTEM.md` (tokens + screens).

---

## 0. Where the repo already is

Already built (do not rewrite — extend):

| Area | Path | State |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | working |
| Shared zod types | `packages/shared-types/src/*` | itinerary, poi, map, preferences, edits, job, booking done |
| Pure engine | `packages/itinerary-engine/src/*` | haversine, scoring, validator, warnings, alternates |
| Map projection | `packages/map-projection/src/affine.ts` | affine solver exists, `matrix` in transform.json is still `[0,0,0,0,0,0]` — **unsolved** |
| API modules | `apps/api/src/modules/*` | bookings, catalog, distances, editing, generation, guest, insights, jobs, questionnaire, review |
| Worker | `apps/api/src/workers/runner.ts` | Postgres jobs table + polling |
| Web | `apps/web/src/app/*` | questionnaire, trip, admin review, admin catalog, admin maps, dev/map |
| Map components | `apps/web/src/components/map/*` | MapCanvas, PinLayer, RouteLayer, DayFilter, usePanZoom, useProjection, useAnimationSequence |

Gaps to close in this phase:

1. Map artwork is a 3.8 KB placeholder SVG — needs the real illustration plus an asset build pipeline.
2. `transform.json.matrix` is zeros — the affine fit has never been run.
3. Projection and route geometry are computed **in the browser** (`useProjection`) — must move to publish time.
4. No booking/commission CTA wiring (`booking_leads` table exists, nothing writes to it).
5. No design tokens — `tailwind.config.ts` has placeholder colours, not Lohono's.
6. No `<picture>` / AVIF ladder / preload — the single biggest load-time win.

---

## 1. End-to-end flow

```
  Guest books villa on lohono.com
          |
          |  booking webhook (or nightly CSV import for MVP)
          v
  POST /bookings ---> bookings row + signed token
          |
          |  console.log the WhatsApp/email link (sending is out of scope)
          v
  /questionnaire/<token>          6 steps, ~90 seconds, no login
          |
          v
  POST /questionnaire/<token> ---> guest_preferences + derived_tags[]
          |                        enqueue job { kind: 'generate_itinerary' }
          v
  worker picks job (polls every 2s)
    1. retrieve   -> shortlist ~60 POIs from catalog (SQL, no LLM)
    2. select     -> Claude returns POI IDs only, per day, per slot
    3. validate   -> engine rejects hallucinated IDs, retries once with repair prompt
    4. hydrate    -> attach real distances from poi_distances (never computed live)
    5. narrate    -> Claude writes copy for the already-frozen selection
    6. warnings   -> engine runs all warning rules
          |
          v
  itinerary status = 'review', sla_due_at = now() + 24h
          |
          v
  /admin/review                   queue sorted by SLA burn-down
          |
          |  reviewer swaps / reorders / rewrites — every action writes itinerary_edits
          v
  POST /review/:id/publish
    -> denormalise EVERYTHING into itineraries.published_snapshot (jsonb)
    -> including precomputed map overlay geometry (section 6.3)
    -> revalidateTag('trip:' + token)
          |
          v
  /trip/<token>                   guest sees it. Static HTML from cache.
          |
          +- swap a stop (in-catalog)  -> auto-publish v N+1, non-blocking warning shown
          +- free-text request         -> back to review queue, guest sees "concierge is on it"
          +- "Book this" CTA           -> /l/:leadId -> log booking_leads -> 302 to partner
```

**The rule that keeps it honest:** the LLM never invents a place. It picks IDs out of a
curated catalog. Anything it returns that is not a real `poi.id` is dropped by the
validator before a human ever sees it.

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Web | Next.js 15 App Router, React 19, TS strict | RSC lets us ship the map overlay as static HTML |
| Styling | Tailwind + CSS custom properties | tokens in one file, swappable |
| Animation | Framer Motion (guest map only), raw CSS elsewhere | keeps JS off the admin side |
| API | Node 22 + Fastify + zod | already in place |
| DB | Postgres 16 + Drizzle | already in place |
| Queue | `jobs` table + polling worker | no Redis; a 2s poll is fine at this volume |
| LLM | `@anthropic-ai/sdk`, `claude-sonnet-5` | structured JSON, two passes |
| Images | `sharp` at build time (Node) — see section 7 for the Python question | AVIF/WebP ladder |
| Tests | Vitest | engine and projection are pure, so they are cheap to test |
| Infra (dev) | docker compose, postgres only | |

---

## 3. File structure

Modular by domain. Nothing over ~150 lines. No file does two jobs.

```
apps/
  api/
    src/
      config/env.ts                  zod-validated env, fails fast at boot
      db/
        client.ts
        schema/                      one file per table
        seed/
      modules/<domain>/
        routes.ts                    HTTP only. never touches db.
        service.ts                   orchestration + business rules
        repository.ts                SQL only
        schema.ts                    request/response zod
      modules/
        bookings/                    create booking, issue token
        questionnaire/               serve questions, accept answers, derive tags
        generation/
          retriever.ts               SQL shortlist -> candidate POIs
          prompts/v1-select.ts       pass 1 prompt
          prompts/v1-narrate.ts      pass 2 prompt
          providers/anthropic.ts     LLM client
          repair.ts                  one retry with the validator's complaint
          service.ts                 the 6-step pipeline
        review/
          sla.ts                     due-at math + burn-down buckets
          snapshot.ts                * builds published_snapshot (incl. map overlay)
        editing/                     swap / reorder / regenerate + scope guard
        leads/                       * NEW — commission click tracking
        catalog/                     POI CRUD for ops
        distances/                   poi_distances read + backfill
        insights/                    reason-code analytics
        jobs/
      workers/runner.ts
      lib/token.ts                   HMAC signed tokens
    scripts/
      build-distances.ts             backfill poi_distances matrix

  web/
    src/
      app/
        questionnaire/[token]/
        trip/[token]/                guest itinerary (RSC shell + island)
        admin/review/                queue + detail
        admin/catalog/
        admin/maps/[destination]/    anchor placement tool
        l/[leadId]/route.ts          * NEW — commission redirect
      components/
        map/
          MapCanvas.tsx              container + pan/zoom
          StaticOverlay.tsx          * NEW — server-rendered SVG, no JS needed
          PinLayer.tsx
          RouteLayer.tsx
          DistanceLabels.tsx
          DayFilter.tsx
          hooks/{usePanZoom,useAnimationSequence,useArtworkPreload}.ts
        itinerary/
          DayTimeline.tsx
          StopCard.tsx
          SwapDrawer.tsx
          WarningBanner.tsx
          BookCta.tsx                * NEW
        ui/                          Button, Chip, Sheet, Field — the design system
      lib/
        api.ts
        tokens.css                   * NEW — the Lohono palette, single source of truth

packages/
  shared-types/          zod schemas — the contract between api and web
  itinerary-engine/      PURE. no io, no fetch, no db, no framework.
    scoring.ts           preference -> POI fit score
    validator.ts         rejects hallucinated ids, bad slots, impossible days
    warnings.ts          the non-blocking warning rules
    alternates.ts        "what else could go here" for the swap drawer
    geometry.ts          * NEW — bezier route paths + label anchors (pure)
  map-projection/        affine lat/lng <-> x/y solver
  config/                shared tsconfigs

tools/
  mapkit/                * NEW — offline asset pipeline (section 7)
    build-artwork.mjs    sharp: AVIF/WebP ladder + LQIP
    fit-transform.mjs    least-squares affine fit from anchors
```

---

## 4. The questionnaire

Six steps, one question per screen, progress dots, everything optional except step 1.
Target completion under 90 seconds. Schema already exists at
`packages/shared-types/src/preferences.ts`.

| # | Question | Control | Maps to |
|---|---|---|---|
| 1 | "What's this trip for?" | multi-select chips (max 3) | `vibes[]` — relax, adventure, romantic, party, cultural, foodie, family, wellness |
| 2 | "How full should the days feel?" | 3-stop slider | `pace` — slow / balanced / packed |
| 3 | "Who's coming?" | counters: adults, kids + age chips | `partyComposition`, `kidAges[]` |
| 4 | "Spending style for meals and activities?" | 4 cards | `budget` — value / moderate / premium / no_limit |
| 5 | "Anything you'd love to do?" | chip cloud + free text | `interests[]` |
| 6 | "Anything we should avoid?" | dietary chips + free text | `dietary[]`, `mobilityNotes` |

On submit, `service.ts` derives `derived_tags[]` — e.g. any `kidAges` under 6 implies
`+no_late_dinner`, `+short_drives`; `vibes` containing `party` implies `+nightlife`,
`-early_start`. These tags are what the retriever filters and scores on, not the raw
answers.

---

## 5. Generation pipeline

**Two passes, because selection and prose are different problems.** Mixing them makes the
model invent places to justify a sentence it already wrote.

### 5.1 Retrieve (SQL, no LLM)

```sql
-- shortlist ~60 candidates, scored in Postgres
select p.*,
       (p.quality_score * 0.4
        + (case when p.vibe_tags && :derived_tags then 1 else 0 end) * 0.3
        + (1 - least(d.meters, 60000)::float / 60000) * 0.3) as fit
from pois p
join poi_distances d on d.from_id = :villa_id and d.to_id = p.id
where p.destination_id = :destination_id
  and p.price_band = any(:budget_bands)
  and (not :has_young_kids or p.kid_friendly)
order by fit desc
limit 60;
```

Never send the whole catalog to the model. Sixty rows keeps the prompt near 4k tokens.

### 5.2 Select (Claude, pass 1)

Input: guest profile, trip dates, villa, and the 60 candidates as
`id | name | category | drive_min | tags | price | duration`.
Output: `llmSelectionSchema` — day to slot to `poiId`. No prose. Temperature 0.3.

### 5.3 Validate (pure engine)

`validator.ts` checks: every `poiId` exists in the candidate set; no POI repeats across
the trip; slots are chronologically ordered; each day has 3–6 stops; total drive per day
is under a hard ceiling. On failure, `repair.ts` retries **once** with the exact complaint
appended. A second failure marks the job `failed` and ops gets an empty draft in the
queue rather than a broken one.

### 5.4 Hydrate

Attach `driveFromPreviousSec` / `driveFromPreviousMeters` by reading `poi_distances`.
**Distances are never computed at request time** — they are backfilled once per
destination by `scripts/build-distances.ts` (haversine times a 1.35 road factor for MVP;
a real matrix API can be swapped in later without touching any other code).

### 5.5 Narrate (Claude, pass 2)

The selection is now frozen. The model receives it plus `concierge_note` per POI and
writes `summary`, a per-day `theme`, and per-stop `copy` (max 40 words, second person, no
superlatives, no invented facts). Temperature 0.7.

### 5.6 Warn

`warnings.ts` runs every rule. Warnings attach to stops and days; they never block.

Cost per itinerary is roughly 6k input + 2k output tokens across both passes. Log
`cost_usd` on the row.

---

## 6. The illustrated map

This is the part that has to be fast. Here is the whole design.

### 6.1 What it is

A stack of layers over **one flat hand-illustrated raster** of the destination. The
artwork contains **no text** — every label is SVG on top, so we can relabel, translate and
re-style without re-exporting art.

```
  z4   UI overlay      day filter, legend, reset — plain HTML
  z3   Distance labels <text> on a <textPath> following the route
  z2   Route layer     quadratic bezier paths, villa -> stop -> stop
  z1   Pin layer       villa pin + POI pins, category icons from a <symbol> sprite
  z0   Artwork         <picture> AVIF/WebP, 3 widths, LQIP placeholder
```

### 6.2 Georeferencing (lat/lng to x/y on a drawing)

An illustrated map is not to scale, so no standard projection works. Instead:

1. Ops opens `/admin/maps/goa` and clicks 8–12 known landmarks on the artwork. Each click
   stores `{ lat, lng, x, y }` — that is the `anchors` array already in `transform.json`.
2. A least-squares fit turns those anchors into a 6-value affine matrix `[a,b,c,d,e,f]`
   such that `x = a*lng + b*lat + c` and `y = d*lng + e*lat + f`.
3. `packages/map-projection` applies it. `validate.ts` reports residual error per anchor,
   so ops can see which pin is dragging the fit and move it.

> **Current state: `matrix` is `[0,0,0,0,0,0]` — the fit has never been run. Running it is
> task 2 in the build order.**

If residuals stay above ~25px on a 2048px artwork, upgrade from affine to a **thin-plate
spline** (piecewise, honours local distortion). Affine is enough for Goa; TPS matters for
long coastlines.

### 6.3 Precompute the overlay at publish time

This is the architectural change that makes the map feel instant.

Today `useProjection` runs the affine transform in the browser on every render, and
`RouteLayer` builds bezier `d` strings client-side. Move all of it into
`modules/review/snapshot.ts`, so `published_snapshot` carries:

```jsonc
"mapOverlay": {
  "asset": { "base": "/maps/goa/v3/artwork", "w": 2048, "h": 1536, "lqip": "data:image/webp;base64,..." },
  "villa": { "x": 981, "y": 1204, "label": "Villa Amarelo" },
  "pins":  [ { "id": "...", "x": 1035, "y": 1020, "day": 0, "order": 1, "icon": "beach", "label": "Anjuna" } ],
  "routes":[ { "id": "...", "day": 0, "d": "M981,1204 Q1008,1112 1035,1020",
               "labelX": 1010, "labelY": 1108, "text": "18 min · 7.4 km" } ]
}
```

Consequences:

- The browser does **zero** maths. It renders ~35 SVG nodes straight from JSON.
- The overlay can be rendered in a **React Server Component** — pins and routes exist in
  the initial HTML. The map is visible before any JS executes.
- Only the pan/zoom + animation wrapper is a client island. It hydrates late
  (`next/dynamic`, `ssr: false`) and simply takes over an SVG that is already on screen.
- The frozen-snapshot rule (CLAUDE.md #3) now covers the map too — republishing artwork v4
  cannot silently move pins on an itinerary published against v3.

`geometry.ts` in `itinerary-engine` holds the bezier and label maths as pure functions, so
it is unit-testable and shared with the admin preview.

### 6.4 Asset pipeline — the load-time fix

| Technique | Detail | Win |
|---|---|---|
| **Format** | AVIF primary, WebP fallback, no PNG/JPEG | flat illustration at 1600px: PNG ~1.8 MB becomes AVIF **~120–180 KB** |
| **Do not ship the SVG artwork** | a detailed hand illustration as SVG is tens of thousands of nodes; rasterise it | avoids 300ms+ of rasterisation and a huge DOM |
| **Responsive ladder** | export at 960 / 1600 / 2400, `<picture srcset sizes>` | a phone downloads the 960 (~60 KB), not the 2400 |
| **LQIP** | 24px blurred WebP inlined as base64 in the snapshot, CSS-blurred, cross-faded on decode | something on screen at first paint, ~400 bytes |
| **Preload** | the URL is known server-side from the snapshot, so emit `<link rel="preload" as="image" fetchpriority="high" imagesrcset=...>` in the RSC head | the image request starts with the HTML, not after JS |
| **Immutable CDN** | versioned path `/maps/goa/v3/artwork-1600.avif`, `Cache-Control: public, max-age=31536000, immutable` | repeat visits and the admin preview are free |
| **Deep zoom, lazily** | the 2400px variant is fetched only when the user zooms past 1.5x | most sessions never pay for it |
| **No tiling** | explicitly out of scope; cap zoom at 2.5x instead | a tile server is weeks of work for a map the size of one image |
| **Page caching** | `/trip/[token]` is ISR-cached; `revalidateTag('trip:' + token)` fires on publish | HTML from the CDN edge, not a DB round trip |
| **Decode off the main thread** | `decoding="async"` plus `await img.decode()` before the fade | no jank on the cross-fade |
| **Below the fold** | `content-visibility: auto; contain-intrinsic-size: 0 640px` on day cards | shorter first layout pass |
| **Animate two properties only** | `transform` and `opacity`; routes use `stroke-dashoffset` on 8 or fewer short paths | stays on the compositor |
| **Fonts** | one display face, `font-display: swap`, subset to latin | no invisible-text stall |

**Budgets (enforce in CI with Lighthouse CI):**

| Metric | Target |
|---|---|
| LCP on Moto G / 4G | under 1.5 s |
| Map first paint (LQIP) | under 400 ms |
| Artwork decoded and faded in | under 1.2 s |
| Map interactive (pan/zoom) | under 2.5 s |
| JS on `/trip/[token]` | under 120 KB gzipped |
| CLS | under 0.05 (reserve the box with `aspect-ratio`) |

### 6.5 Animation sequence

Triggered by IntersectionObserver, respects `prefers-reduced-motion` (reduced jumps
straight to `done`):

```
0ms    artwork cross-fades from LQIP           200ms
100ms  villa pin scales 0.6 -> 1, slight bounce 200ms
300ms  POI pins stagger in                     60ms apart
600ms  routes draw, stroke-dashoffset -> 0     500ms each, sequenced per day
+200ms distance label fades in after its route 150ms
```

A "Skip animation" pill is always present (already implemented in `MapCanvas.tsx`).

### 6.6 Interaction

- Pan/drag, wheel/pinch zoom 1x–2.5x, "Reset view".
- Day filter chips — non-active days drop to 20% opacity, their routes hide.
- Tap a pin and its `StopCard` scrolls into view and highlights; tapping a card highlights
  the pin.
- Mobile: the map is a sticky 40vh header that collapses to 20vh as the day list scrolls.

---

## 7. "Is there a Python library that makes this faster?"

Short answer: **not at runtime — and adding Python to the request path would make it
slower**, because you would be putting an HTTP hop between Node and the response. The page
is served by Next.js; keep it that way.

Python is, however, a genuinely good fit for the **offline build step**, which is where all
the real work happens:

| Job | Python option | Node option | Recommendation |
|---|---|---|---|
| AVIF/WebP ladder from the master art | `pyvips` (fastest), `Pillow` | **`sharp`** (libvips too) | **sharp** — same C library, one language, runs in `pnpm map:build` |
| LQIP / blurhash | `blurhash-python` | `blurhash` npm, or sharp resize to 24px | sharp |
| **Fit the affine matrix from anchors** | `numpy.linalg.lstsq` — three lines, exact | hand-rolled normal equations | Python is genuinely nicer here, but it is ~40 lines in TS and `packages/map-projection` already exists |
| Upgrade to thin-plate spline later | `scipy.interpolate.RBFInterpolator` | nothing good | **Python, when you need it** |
| Per-day stop ordering (TSP) | OR-Tools | greedy nearest-neighbour | greedy is fine for 6 stops; OR-Tools only if you scale to 20 |
| Palette-matching the illustration to brand tokens | `scikit-image`, `numpy` | — | Python, as a one-off design task |

**Decision for MVP: zero Python.** Do the image ladder with `sharp` and the affine fit with
the TS solver already in `packages/map-projection`. Revisit Python only for thin-plate
splines or OR-Tools — and even then it stays in `tools/`, runs manually, and commits its
output. Nothing Python ever runs while a guest is waiting.

The load-time problem is not a compute problem. It is a **payload and timing** problem:
ship AVIF instead of PNG, precompute the geometry, preload the image, cache the page. That
is 95% of the win.

---

## 8. Human review — the quality gate

### 8.1 Queue (`/admin/review`)

Rows sorted by SLA burn-down. Columns: guest, villa, dates, party, generated-at, **time
left** (green above 12h, amber 4–12h, red under 4h, black once breached), model, cost.
Filters: destination, status, breach risk.

### 8.2 Detail (`/admin/review/:id`)

Three panes: map preview (left, sticky), day-by-day editor (centre), alternates panel
(right). The reviewer can swap a stop, reorder, retime, rewrite copy, regenerate a whole
day, or add a concierge note.

### 8.3 Every edit is a labelled training example

**Non-negotiable rule #6:** every action writes an `itinerary_edits` row with `before`
JSON, `after` JSON, `actor`, and a **`reason_code`**. Reason codes are the class labels:

`TOO_FAR` · `CLOSED` · `WRONG_VIBE` · `NOT_KID_SAFE` · `TOO_EXPENSIVE` · `SEASONAL` ·
`DUPLICATE_FEEL` · `BETTER_ALTERNATIVE` · `COPY_TONE` · `PACING` · `PARTNER_PRIORITY`

`/admin/insights` charts reason-code frequency over time. A spike in `TOO_FAR` means the
retriever's distance weight is wrong. A spike in `WRONG_VIBE` means the tag derivation is
wrong. **This is how the prompt improves — not by vibes.** Reason-code counts drive the
next `promptVersion`.

### 8.4 Publish

`POST /review/:id/publish` calls `snapshot.ts`, which denormalises everything (POI names,
photos, notes, distances, map overlay geometry, warnings) into `published_snapshot`, bumps
`version`, sets status to `published`, revalidates the cache tag, and logs the delivery.
After this the guest page never joins another table.

---

## 9. Editing — a plan, not a brochure

| Action | Who | Path |
|---|---|---|
| Swap one stop | guest | picks from `alternates.ts` (same slot, same day, catalog only), auto-publishes v N+1 |
| Reorder a day | guest | drag; engine re-runs distances and warnings, v N+1 |
| Regenerate a day | guest | one per trip; re-runs the pipeline for that day only, back to review |
| Free-text request | guest | "we'd love a cooking class" creates a review task; guest sees "your concierge is on it" |
| Anything | reviewer | full edit rights |

### Scope guard — warnings, never blocks

Guest edits stay inside the catalog, so they cannot break the plan. What they *can* do is
make it worse, so we say so — inline, dismissible, never modal:

| Code | Copy shown to guest |
|---|---|
| `DRIVE_HEAVY` | "This day now has over 3 hours of driving." |
| `CLOSED_TODAY` | "This spot is closed on Tuesday — your visit day." |
| `SEASON_OFF` | "Best avoided in monsoon — the road in gets rough." |
| `KID_UNFRIENDLY` | "This one may not suit a 4-year-old." |
| `CATEGORY_HEAVY` | "Three restaurants in one day is a lot of sitting." |
| `TIMING_TIGHT` | "Back-to-back — you'll be rushing." |
| `REPEAT_VIBE` | "Day 3 now feels a lot like Day 1." |
| `NOT_BOOKABLE` | "We can't hold a table here — walk-in only." |
| `COVERAGE_DROP` | "Swapping this out means you'll miss Old Goa entirely." |

`COVERAGE_DROP` is the "you won't cover everything" warning: the engine diffs vibe and area
coverage before and after the edit, and flags what fell off.

---

## 10. Bookings and commission

The `booking_leads` table already exists. Wire it up:

1. Every stop with `bookable = true` renders a `BookCta` — "Reserve a table", "Book this
   experience", "Arrange a cab".
2. The CTA links to `/l/[leadId]` (a Next route handler), **not** straight to the partner.
3. That handler inserts `booking_leads { itinerary_id, stop_id, url, clicked_at }` and 302s
   to the partner URL with affiliate params appended.
4. A trip-level "Getting there" card groups flights and the airport transfer the same way.

| Category | Partner shape | MVP behaviour |
|---|---|---|
| Flights | affiliate deep link | stub link, log the click |
| Airport transfer / cabs | Lohono's own fleet or a local operator, fixed rate card | stub, log |
| Restaurants | direct reservation, commission per cover | stub, log |
| Experiences (cruise, cooking class, diving) | local operator, percentage of ticket | stub, log |
| Spa / in-villa chef | Lohono's own services — highest margin | surface these first |

**MVP scope: stub the CTA and log the click.** No real booking APIs (CLAUDE.md). The click
log is what proves the funnel before anyone integrates anything. `/admin/insights` shows
clicks per category per itinerary.

---

## 11. Data model additions

Everything in `docs/PLAN.md` section 5 stays. Add:

```sql
-- pois
alter table pois add column photo_url text;
alter table pois add column booking_url text;
alter table pois add column partner_id uuid;          -- nullable, for commission attribution

-- map_assets: one row per destination per artwork version
-- image_url now stores the BASE path; the ladder is derived: {base}-960.avif etc.
alter table map_assets add column lqip text;          -- base64 data uri
alter table map_assets add column widths int[] default '{960,1600,2400}';

-- itineraries: pin the artwork version the snapshot was built against
alter table itineraries add column map_asset_version int;
```

---

## 12. Build order for Antigravity

Each task is independently shippable with a clear acceptance test.

**Phase 1 — foundations (unblocks everything visual)**

1. `docs/DESIGN_SYSTEM.md` tokens into `apps/web/src/lib/tokens.css` and
   `tailwind.config.ts`. *Accept:* no hardcoded hex remains anywhere in `apps/web`.
2. Run the affine fit; write a real `matrix` into `transform.json`.
   *Accept:* the `map-projection` residual test passes, max anchor error under 25px.
3. `tools/mapkit/build-artwork.mjs` plus a `pnpm map:build` script.
   *Accept:* produces `artwork-{960,1600,2400}.{avif,webp}` and `lqip.txt`; the 1600 AVIF is
   under 200 KB.

**Phase 2 — the map gets fast**

4. `packages/itinerary-engine/src/geometry.ts` — pure bezier and label maths, with tests.
5. `modules/review/snapshot.ts` emits `mapOverlay` (section 6.3).
   *Accept:* a published snapshot contains x/y for every pin and a `d` string per route.
6. `components/map/StaticOverlay.tsx` — a server component reading `mapOverlay`.
   *Accept:* with JS disabled, `/trip/<token>` still renders map, pins and routes.
7. `<picture>` plus preload plus the LQIP cross-fade in `MapCanvas`.
   *Accept:* Lighthouse LCP under 1.5s on the mobile 4G preset.
8. `MapCanvas` becomes a thin client island over the static overlay.

**Phase 3 — the guest experience**

9. Questionnaire polish — 6 steps, progress, resume from token, mobile-first.
10. `/trip/[token]` redesigned against the design system: hero, sticky map, day timeline.
11. `SwapDrawer`, `WarningBanner`, and the `COVERAGE_DROP` rule.
12. `BookCta`, the `/l/[leadId]` route, and `modules/leads`.

**Phase 4 — the quality gate**

13. Review queue with SLA burn-down colours.
14. Review detail: three-pane workspace, reason-code picker on every edit.
15. `/admin/insights`: reason-code frequency, SLA compliance, lead clicks.

**Phase 5 — hardening**

16. Lighthouse CI budget gate.
17. Seed a second destination (Alibaug) to prove the data model is not Goa-shaped.
18. Vitest coverage on engine and projection at 90% or above.

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Illustration commissioned at the wrong aspect ratio | lock 4:3 at 2048x1536 before briefing the illustrator; no text in the art |
| The affine fit is visibly wrong on a curved coast | anchor residual viewer in `/admin/maps`; TPS upgrade path |
| 24h SLA breached at volume | queue sorted by burn-down plus an `sla_breach_risk` job that warns at T-4h |
| Model picks a closed or seasonal POI | `opening_hours` and `seasonality` are filters in the retriever, not just warnings |
| Guest edits into an incoherent trip | catalog-only swaps plus `COVERAGE_DROP` |
| Artwork version drift breaks old snapshots | `map_asset_version` pinned per itinerary; assets are immutable |
