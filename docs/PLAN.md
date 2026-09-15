# Lohono Concierge — Technical Plan

## 1. Product

AI-generated, human-reviewed villa itineraries. Each booking becomes a 3–7 day trip plan bound to a specific villa, with an illustrated map that animates in as the guest scrolls.

## 2. The illustrated map

### 2.1 Architecture

The map is a stack of layers over a single hand-illustrated PNG/SVG artwork of the destination coast/region. Artwork has zero text.

Layers, bottom to top:
1. **Artwork** — the illustration, preloaded.
2. **PinLayer** — SVG circles/sprites for villa and each POI.
3. **RouteLayer** — curved Bézier paths connecting consecutive stops.
4. **DistanceLabels** — `<textPath>` on routes.
5. **UI overlay** — day filter, legend.

### 2.4 Animation sequence

On enter viewport (IntersectionObserver):
- artwork fades in (200ms)
- villa pin scales up (200ms, 100ms delay)
- POI pins stagger in (60ms stagger)
- routes stroke-dashoffset from full → 0 (800ms per route, sequenced)
- distance labels fade in after the route they belong to

Respect `prefers-reduced-motion`.

## 5. Data model

Tables (all with `id uuid pk`, `created_at`, `updated_at`):

- `destinations` — id, name, slug, timezone, bbox_json
- `villas` — id, destination_id, name, slug, lat, lng, bedrooms, description
- `pois` — id, destination_id, name, category, lat, lng, vibe_tags[], price_band, avg_duration_min, opening_hours (jsonb), seasonality (jsonb), kid_friendly, bookable, concierge_note, quality_score
- `poi_distances` — from_id, to_id (either poi or villa), meters, seconds
- `bookings` — id, villa_id, guest_name, check_in, check_out, party_size, token
- `guest_preferences` — booking_id, answers (jsonb), derived_tags[]
- `itineraries` — id, booking_id, status (draft/review/published), sla_due_at, prompt_version, model, cost, published_snapshot (jsonb), version
- `itinerary_edits` — id, itinerary_id, actor (guest/reviewer), before, after, reason_code, note
- `jobs` — id, kind, payload (jsonb), status, attempts, next_run_at, last_error
- `booking_leads` — id, itinerary_id, stop_id, url, clicked_at
- `map_assets` — id, destination_id, version, image_url, transform_json

## 7. Editing model

Guest edits within catalog auto-publish v N+1. Free-text edits re-enter review.

Warnings (non-blocking):
- DRIVE_HEAVY: "This day involves over 3 hours of driving."
- CLOSED_TODAY: "This stop is closed on your visit day."
- SEASON_OFF: "This spot is best avoided during monsoon."
- KID_UNFRIENDLY: "This stop may not suit young children."
- CATEGORY_HEAVY: "Three restaurants in one day — heavy dining."
- TIMING_TIGHT: "Back-to-back stops leave little breathing room."
- REPEAT_VIBE: "This day feels similar to another day."

## 8. Review + training signal

Every edit is a labelled example of "how the model got it wrong." Reason codes are the class labels.

## 9. Performance

- LCP < 1.5s on 4G
- Only `transform` + `opacity` animated
- Map dynamically imported, `ssr: false`
- Preload artwork with `<link rel="preload" fetchpriority="high">`
- `content-visibility: auto` below the fold
