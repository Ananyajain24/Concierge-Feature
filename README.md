# Lohono Concierge

A personalised, AI-generated villa itinerary — reviewed by a human concierge before the guest ever sees it — paired with an animated, illustrated destination map instead of a plain Google Maps embed.

## Demo
[Watch the walkthrough](https://www.loom.com/share/dc0c221fdb35488bb10c1927998d2654)

## What it does
- After booking, the guest answers a short questionnaire — trip vibe, pace, kids, budget.
- An LLM builds a day-by-day itinerary, but only by picking places from our curated POI catalog. It never invents a restaurant.
- A concierge reviews and can tweak it inside a 24-hour SLA before it's published. Every edit is logged with a reason — that log is what makes the system improve over time.
- The guest sees an illustrated map of the destination with the villa, every stop, and the drive time between them animated in.
- The guest can swap a stop, move a day, or regenerate — with non-blocking warnings if an edit pushes outside what's bookable or covered.
- Bookable stops (restaurants, transfers, experiences) link out through partner affiliates and earn commission.

## How it's built
- **The map isn't generated per guest.** One illustrated artwork per destination is drawn once and cached forever on a CDN. What's per-guest is a small overlay of pins, routes, and distance labels — a few KB laid on top.
- **The LLM never writes free text about a place.** It selects IDs from the POI catalog; a deterministic validator rejects anything that doesn't exist, is too far, or is closed that day. Descriptive copy is written in a second pass over the already-validated structure.
- **Published itineraries are frozen.** Once approved, the whole page is baked into one JSON snapshot and served from cache — no database joins on the guest's read path.

Full architecture, data model, and performance approach: [`docs/PLAN.md`](docs/PLAN.md). Build conventions and scope: [`AGENTS.md`](AGENTS.md).

## Tech stack
| | |
|---|---|
| Frontend | React 19 (Next.js 15, App Router), TypeScript, Tailwind, Framer Motion |
| Backend | Node 22, Fastify, TypeScript, Zod |
| Database | PostgreSQL 16, Drizzle ORM |
| Generation | Gemini API, structured JSON output |
| Monorepo | pnpm workspaces + Turborepo |

## Status
MVP in progress, scoped to one destination (Goa) end to end. See `AGENTS.md` for what's explicitly in and out of scope.

## Setup

**Prerequisites:** Node.js 22+, pnpm 9+, Docker (for local Postgres)

```bash
git clone <repo-url>
cd lohono-concierge
pnpm install

cp .env.example .env      # fill in DATABASE_URL, GEMINI_API_KEY, etc.

docker compose up -d      # starts Postgres
pnpm db:push               # applies the schema
pnpm db:seed                # seeds the Goa destination, villas, and POI catalog
pnpm dev                     # runs the web app and API together
```

`pnpm dev` starts the web app at `http://localhost:3000`; check your terminal output or `.env` for the API port.

### Commands
| Command | Does |
|---|---|
| `pnpm dev` | Run web + API together |
| `pnpm db:push` | Apply schema changes |
| `pnpm db:seed` | Seed the Goa destination data |
| `pnpm db:studio` | Browse the database |
| `pnpm test` | Run tests |
| `pnpm typecheck` | Type-check everything |
