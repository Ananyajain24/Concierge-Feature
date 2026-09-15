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
2. **`packages/itinerary-engine` is pure.** No I/O, no fetch, no db, no framework imports.
3. **Published itineraries are frozen snapshots.** On publish, denormalise the whole render payload into `itineraries.published_snapshot` (jsonb).
4. **Distances are never computed at request time.** They come from `poi_distances`.
5. **Map artwork carries no text.** SVG overlay handles pins/labels.
6. **Every edit writes an `itinerary_edits` row** with before/after JSON and a `reason_code`.
7. **Types live in `packages/shared-types` as zod schemas.**

## Conventions

- One module per domain concept under `apps/api/src/modules/<name>/`, each with `routes.ts`, `service.ts`, `repository.ts`, `schema.ts`. Routes never touch the db.
- React components stay under ~150 lines. Hooks in sibling `hooks/` dir.
- No `any`. No default exports except Next.js pages.
- Prefer server components; mark client components explicitly and keep them small.
- Env vars validated with zod at boot in `apps/api/src/config/env.ts`. Fail fast.

## Commands

- `pnpm dev` — web + api together
- `pnpm db:push` / `pnpm db:seed` / `pnpm db:studio`
- `pnpm test`, `pnpm typecheck`, `pnpm lint`
