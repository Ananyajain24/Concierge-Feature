# Claude Code Prompt Pack — Lohono Concierge MVP

## How to use this

1. Create an empty repo and `cd` into it.
2. Save the plan doc from earlier as `docs/PLAN.md` in that repo.
3. Save the CLAUDE.md content from Section A as `CLAUDE.md` in the repo root.
4. Start Claude Code and paste the **Kickoff prompt** (Section B).
5. Work through milestones M1–M7 (Section C) **one at a time**, in separate messages.

Do not paste all the milestones at once. Claude Code produces much better results when each session has a scoped, verifiable goal. After each milestone, run the app, check it works, then move on.

---

## Section A — `CLAUDE.md` (save this to repo root)

```markdown
# Lohono Concierge

AI-generated, human-reviewed villa itineraries with an illustrated destination map.
Full technical plan: `docs/PLAN.md`. Read it before making architectural decisions.

## MVP scope — one destination (Goa), one villa, end to end

In scope:
- Guest questionnaire (tokenised link, no login)
- Async itinerary generation via Claude API, constrained to a curated POI catalog
- Admin review queue with reason-coded edits, then publish
- Guest itinerary page with animated illustrated map
- Swap-a-stop editing with non-blocking warnings

Explicitly OUT of scope for MVP — do not build these:
- User accounts / auth beyond signed tokens
- Real partner booking APIs (stub the CTA, log the click)
- Map tiling (single optimised image is enough)
- Redis / BullMQ (use a Postgres jobs table + polling worker)
- PostGIS (use lat/lng columns + haversine in SQL)
- Multi-destination support beyond a clean data model that allows it
- Payments, emails, WhatsApp sending (log to console instead)

## Stack

- Monorepo: pnpm workspaces + Turborepo
- Web: Next.js 15 (App Router), React 19, TypeScript strict, Tailwind, Framer Motion
- API: Node 22 + Fastify + TypeScript, zod schemas
- DB: Postgres 16, Drizzle ORM, migrations checked in
- LLM: `@anthropic-ai/sdk`, structured JSON output
- Test: Vitest. Local infra: docker compose (postgres only)

## Non-negotiable architecture rules

1. **The LLM selects POI IDs from the catalog. It never invents places.**
   Generation returns JSON referencing `poi.id` values. A deterministic validator
   rejects any ID that doesn't exist. Prose is a separate second pass over a fixed structure.

2. **`packages/itinerary-engine` is pure.** No I/O, no fetch, no db, no framework
   imports. Validation, warnings, drive-time budgets, scoring = pure functions over
   plain data. If you need to reach for a database inside it, the design is wrong.

3. **Published itineraries are frozen snapshots.** On publish, denormalise the whole
   render payload into `itineraries.published_snapshot` (jsonb). The guest endpoint
   serves that blob and nothing else. No joins at read time.

4. **Distances are never computed at request time.** They come from the
   `poi_distances` table, populated by a seed/refresh script.

5. **Map artwork carries no text.** No place names, no pins, no distances baked into
   the image. Everything nameable is data rendered as an SVG overlay.

6. **Every reviewer and guest edit writes an `itinerary_edits` row** with
   before/after JSON and a `reason_code`. This is the product's training signal;
   an edit that isn't logged is a bug.

7. **Types live in `packages/shared-types` as zod schemas.** API and web both import
   from there. Never redeclare a shape in two places.

## Conventions

- One module per domain concept under `apps/api/src/modules/<name>/`, each with
  `routes.ts`, `service.ts`, `repository.ts`, `schema.ts`. Routes never touch the db.
- React components stay under ~150 lines. Extract hooks into a sibling `hooks/` dir.
- No `any`. No default exports except Next.js pages.
- Prefer server components; mark client components explicitly and keep them small.
- Env vars validated with zod at boot in `apps/api/src/config/env.ts`. Fail fast.

## Commands

- `pnpm dev` — web + api together
- `pnpm db:push` / `pnpm db:seed` / `pnpm db:studio`
- `pnpm test`, `pnpm typecheck`, `pnpm lint`
```

---

## Section B — Kickoff prompt (paste this first)

```
I'm building "Lohono Concierge" — a feature for a luxury villa rental brand that
gives every booking a personalised, human-reviewed itinerary plus an illustrated
animated destination map.

Read `docs/PLAN.md` and `CLAUDE.md` in full before writing any code. They contain
the architecture, data model, performance strategy, and MVP scope boundaries.

Two things I want to be clear about up front:

1. Do not build the whole thing in this session. I'm going to walk you through
   milestones one at a time. This session is Milestone 0 only.

2. Before you write code, give me a short written plan of what you're about to do
   and flag anything in `docs/PLAN.md` you think is wrong, over-engineered for an
   MVP, or ambiguous. I'd rather fix the design now than refactor later. Wait for
   my go-ahead before implementing.

## Milestone 0 — Foundations

Set up a working, deployable skeleton:

- pnpm workspace + Turborepo with: `apps/web` (Next.js 15, App Router, TS strict,
  Tailwind), `apps/api` (Fastify + TS), `packages/shared-types`,
  `packages/itinerary-engine`, `packages/config` (shared tsconfig/eslint/tailwind).
- `docker-compose.yml` with Postgres 16 only.
- Drizzle set up in `apps/api/src/db/` with the full MVP schema from §5 of the plan,
  simplified per the MVP exclusions in CLAUDE.md (no PostGIS — use
  `lat double precision` / `lng double precision` columns). Split schema files by
  domain, don't put every table in one file.
- Initial migration generated and applied.
- Zod-validated env config that fails fast at boot.
- Fastify server with a `/health` route, error handler, request logging, and CORS.
- Next.js app with Tailwind configured and one placeholder route.
- `pnpm dev` runs both. `pnpm typecheck` and `pnpm test` pass.
- A `README.md` with local setup steps.

Success criteria: I can run `docker compose up -d && pnpm db:push && pnpm dev`,
hit the health endpoint, and load the web app.
```

---

## Section C — Milestone prompts (one per session)

### M1 — Catalog and distances

```
Milestone 1: the POI catalog for Goa.

1. Build the catalog module in the API (`modules/catalog/`) with CRUD endpoints
   for destinations, villas, and POIs, following the module convention in CLAUDE.md.

2. Write a seed script (`apps/api/src/db/seed/goa.ts`) that inserts:
   - 1 destination: Goa (with timezone Asia/Kolkata and a bounding box)
   - 2 villas in North Goa with real coordinates
   - 35–40 real Goa POIs across categories: beach, restaurant, bar, heritage,
     market, spa, watersport, cafe, sunset_point, day_trip.
     Each needs: real lat/lng, category, vibe_tags, price_band, avg_duration_min,
     opening_hours, seasonality (monsoon June–Sept matters here), kid_friendly,
     bookable flag, and a one-line concierge_note in a warm, specific voice.
     Mark roughly 60% as bookable.

3. Write a distance matrix script (`scripts/build-distances.ts`) that populates
   `poi_distances` for every POI pair and villa→POI pair in a destination.
   For MVP use haversine × a 1.35 road-detour factor to estimate drive time at
   35 km/h average — but put this behind a `DistanceProvider` interface so a real
   routing API can be swapped in later without touching callers.

4. Admin UI at `/admin/catalog`: table of POIs with filters, and a create/edit form.
   Keep it functional and plain — this is an internal tool.

Tests: distance script produces a symmetric complete matrix; seed is idempotent.
```

### M2 — The illustrated map (the interesting one)

```
Milestone 2: the illustrated map renderer. This is the core of the product, so
take the time to get the architecture right. Re-read §2 and §9 of `docs/PLAN.md`.

I don't have commissioned artwork yet. Build everything against a placeholder so
the real illustration drops in later with zero code change.

1. `packages/map-projection` — pure TS. Given a set of anchor points
   (lat/lng ↔ artwork pixel), fit and apply a transform mapping geographic
   coordinates to artwork space. Implement affine first with a clean interface that
   allows piecewise/TPS later. Include an error-reporting function that does
   leave-one-out validation on the anchors.

2. Placeholder artwork: generate a stylised SVG of the North Goa coastline
   (coastline, a few roads, river, terrain blocks) at 2048×1536 viewBox, flat
   colour, no text of any kind. Put it in `apps/web/public/maps/goa/v1/`.
   Hand-fit anchors for it and commit them as `transform.json`.

3. `apps/web/components/map/` — build the layered renderer from §2.1:
   - `MapCanvas` — artwork + pan/zoom (pointer events, wheel, pinch; clamp to bounds)
   - `PinLayer` — villa pin distinct from POI pins, category icons from ONE sprite
   - `RouteLayer` — curved paths between consecutive stops, animated via
     stroke-dashoffset
   - `DistanceLabels` — `<textPath>` on the routes with `paint-order: stroke fill`
     so labels stay readable
   - `DayFilter` — show all days or isolate one
   - `useAnimationSequence` — the staggered sequence from §2.4, gated by
     IntersectionObserver, honouring `prefers-reduced-motion`, with a skip control

4. Admin anchor tool at `/admin/maps/[destination]`: load artwork, click a point,
   enter lat/lng, save. Shows live fit error. This is how ops onboards new artwork.

Performance requirements — these are not optional:
- Animate only `transform` and `opacity`
- The map component is dynamically imported, `ssr: false`
- Blurhash/LQIP placeholder rendered inline so there's no layout shift
- Never animate more than 40 pins
- 60fps on a mid-range phone; no long task over 50ms

Build a demo page at `/dev/map` that renders the map with hardcoded pins so I can
see and feel it before any generation exists.
```

### M3 — Questionnaire and generation

```
Milestone 3: guest questionnaire and itinerary generation.

1. Questionnaire at `/questionnaire/[token]` — signed token resolves to a booking,
   no login. 7–8 questions max, mobile-first, one question per screen, progress bar:
   trip vibe (multi-select), pace, party composition, kids + ages, budget band,
   must-do interests, dietary needs, mobility notes. Saves to `guest_preferences`
   with derived tags.

2. Jobs infrastructure: a `jobs` table plus a polling worker
   (`apps/api/src/workers/runner.ts`) with retries, backoff, and dead-lettering.
   No Redis.

3. `modules/generation/`:
   - `retriever.ts` — candidate POI selection: within radius of the villa, open on
     the travel dates, in season, matching vibe/budget/kids tags, above a quality
     floor. Returns a ranked, capped candidate set.
   - `prompts/v1-select.ts` — pass 1. Given villa, dates, preferences, and the
     candidate POI list, return JSON selecting and sequencing POI **IDs** into days.
     Strict JSON schema. No prose.
   - `validator.ts` — lives in `packages/itinerary-engine`, pure. Checks: IDs exist
     and belong to the destination, daily drive time under budget, no duplicates,
     no closed-day conflicts, sane slot ordering. Returns structured violations.
   - `repair.ts` — one feedback pass to the model with the violations, then give up
     and flag for the reviewer.
   - `prompts/v1-narrate.ts` — pass 2. Writes day themes and per-stop copy over the
     now-fixed structure. Warm, specific, never breathless. No superlatives stacking.
   - Every generation records `prompt_version`, model, latency, and token cost.

Test the validator hard — it's the thing standing between the model and the guest.
Include cases for hallucinated IDs, an impossible drive day, and a Tuesday-closed POI.
```

### M4 — Review queue

```
Milestone 4: the concierge review tool. This is the quality gate and the source of
all training signal — see §8 of the plan.

1. `/admin/review` — queue sorted by `sla_due_at`, colour-coded by time remaining,
   breach warning at T-4h. Filters by status and destination.

2. `/admin/review/[id]` — the review workspace, three panes:
   - the generated itinerary, day by day, editable inline
   - live map preview reflecting current edits
   - a swap panel showing ranked alternates for the selected stop

3. Reviewer actions: approve · edit and approve · request regeneration with a note.

4. Every single edit opens a reason-code picker before it commits. Fixed enum:
   WRONG_VIBE, TOO_FAR, CLOSED, TOO_TOURISTY, OVERPRICED, NOT_KID_FRIENDLY,
   BETTER_ALTERNATIVE, COPY_TONE, FACTUAL_ERROR, DUPLICATE, SEQUENCING.
   Writes an `itinerary_edits` row with full before/after JSON. No silent edits.

5. On publish: build the frozen `published_snapshot` (days, stops, copy, pin
   coordinates, distances, map asset URL and version, warnings) and store it.
   Serving the guest view must never require a join.

6. An `sla-monitor` job that logs breaches (console is fine for MVP).
```

### M5 — Guest itinerary view

```
Milestone 5: the guest-facing itinerary page. This is the demo.

`/trip/[token]` — server-rendered from `published_snapshot` only.

- Hero: villa name, dates, a one-line trip summary
- The illustrated map from M2, wired to real itinerary pins, animating on scroll
- Day-by-day timeline below, each stop a card with photo, concierge note, duration,
  drive time from the previous stop, and warning chips where relevant
- Tapping a stop highlights its pin on the map and vice versa
- Booking CTA on bookable stops — for MVP, log a `booking_leads` row and open the
  partner URL in a new tab. No real integration.
- `opengraph-image.tsx` so the link looks right when shared on WhatsApp
- Mobile-first. Assume most guests open this on a phone on hotel wifi.

Performance — measure and report actual numbers to me when done:
- Preload the map artwork via `<link rel="preload" fetchpriority="high">` in head
- `Cache-Control: public, max-age=300, s-maxage=31536000, stale-while-revalidate`
  on the published payload, purge on version bump
- `content-visibility: auto` on below-fold day sections
- Target LCP under 1.5s on simulated 4G
```

### M6 — Editing with scope control

```
Milestone 6: guest editing, per §7 of the plan.

`modules/editing/`:
- `alternates.ts` — given a stop, return 4–6 ranked alternates from the same
  destination and category, scored by travel-time delta and preference match.
  Pure function in `itinerary-engine`, data passed in. No LLM, must be fast.
- Operations: swap stop, move stop between days/slots, remove stop, regenerate a
  day (respects `is_pinned`, rate-limited to 3 per itinerary), add from catalog.

Every operation re-runs the validator and returns warning chips — non-blocking,
never a hard stop. Implement all seven warning types from the plan's table with the
exact guest-facing copy given there.

Rules:
- Edits within the curated catalog auto-publish as version N+1
- Free-text requests ("I want something else entirely") re-enter the review queue
- Every guest edit writes an `itinerary_edits` row, same as reviewer edits

UI: a swap drawer on each stop card. Optimistic updates via TanStack Query, with
rollback on failure.
```

### M7 — Insights

```
Milestone 7: the dashboard that tells us whether any of this is working.

`/admin/insights`:
- Edit rate per itinerary over time (the headline metric — it should trend down)
- Edit rate broken down by reason code
- Per-POI swap-out rate, sorted worst-first. This is the actionable one: a POI
  everyone removes is a catalog problem fixable today.
- Per-POI CTA click rate and click→book conversion
- Generation cost and latency per `prompt_version`
- SLA compliance: % reviewed within 24h, median review time

Plain charts, no design ambition. Recharts is fine.
```

---

## Section D — Working notes

**Run it after every milestone.** Don't stack three milestones of unverified code.

**Re-anchor when context drifts.** In a long session: *"Re-read CLAUDE.md and confirm you're still following the architecture rules, particularly that itinerary-engine stays pure."*

**When it over-builds**, which it will: *"This is more than the MVP needs. Cut it to the minimum that satisfies the success criteria, and list what you removed so I can add it back later."*

**Ask for the plan before the code** on anything architectural. The cheapest correction is the one made before implementation.

**Get the Anthropic API key into `.env` before M3**, and set a spend limit on the key while you're iterating on prompts — generation loops during development burn through credits faster than you'd expect.

**The riskiest milestone is M2**, because the map is the thing that makes this feel like a luxury product rather than a list. Budget more time there than feels reasonable, and get the placeholder artwork looking genuinely good before wiring in real data — it's much easier to judge the animation and pin density against something that resembles the final thing.
