# Lohono Concierge

AI-generated, human-reviewed villa itineraries with an illustrated destination map.

## Local setup

```bash
# 1. install deps (Node 20+ required)
pnpm install

# 2. env
cp .env.example .env

# 3. start postgres
docker compose up -d

# 4. push schema and seed
pnpm db:push
pnpm db:seed

# 5. run both apps
pnpm dev
```

- Web app: http://localhost:3000
- API health: http://localhost:4000/health

## Monorepo layout

```
apps/
  api/                 Fastify + Drizzle
  web/                 Next.js 15 App Router
packages/
  shared-types/        zod schemas shared across api/web
  itinerary-engine/    PURE: validator, warnings, scoring, alternates
  map-projection/      lat/lng ↔ artwork pixel transforms
  config/              shared tsconfigs
```

## Milestones

- **M0** — foundations, DB schema, health endpoint ✓
- **M1** — Goa catalog + distance matrix + admin
- **M2** — illustrated map renderer
- **M3** — questionnaire + generation (Claude API)
- **M4** — review queue + publish
- **M5** — guest itinerary page
- **M6** — guest editing with warnings
- **M7** — insights dashboard

See [docs/PLAN.md](docs/PLAN.md) and [CLAUDE.md](CLAUDE.md).
