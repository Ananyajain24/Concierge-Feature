import { sql } from "drizzle-orm";
import { db } from "../../db/client";

// Insights queries — raw SQL is clearer here than the ORM.
// Every count is per-itinerary or per-poi so the caller can chart directly.

export const insightsRepo = {
  editRateOverTime: () =>
    db.execute(sql/*sql*/`
      SELECT date_trunc('day', i.created_at) AS day,
             COUNT(DISTINCT i.id) AS itinerary_count,
             COALESCE(SUM(e.n), 0)::float / GREATEST(COUNT(DISTINCT i.id), 1) AS avg_edits_per_itinerary
      FROM itineraries i
      LEFT JOIN (
        SELECT itinerary_id, COUNT(*) AS n
        FROM itinerary_edits
        GROUP BY itinerary_id
      ) e ON e.itinerary_id = i.id
      GROUP BY 1
      ORDER BY 1 ASC
    `),

  editRateByReason: () =>
    db.execute(sql/*sql*/`
      SELECT reason_code, COUNT(*)::int AS n
      FROM itinerary_edits
      GROUP BY reason_code
      ORDER BY n DESC
    `),

  poiSwapOutRate: () =>
    db.execute(sql/*sql*/`
      SELECT p.id, p.name, p.category,
             COUNT(e.id) FILTER (WHERE e.actor IN ('guest','reviewer'))::int AS times_swapped_out
      FROM pois p
      LEFT JOIN itinerary_edits e ON e.before::text LIKE '%' || p.id::text || '%'
                                 AND e.after::text NOT LIKE '%' || p.id::text || '%'
      GROUP BY p.id
      ORDER BY times_swapped_out DESC
      LIMIT 30
    `),

  ctaByPoi: () =>
    db.execute(sql/*sql*/`
      SELECT p.id, p.name,
             COUNT(l.id)::int AS clicks
      FROM pois p
      LEFT JOIN booking_leads l ON l.poi_id = p.id
      GROUP BY p.id
      ORDER BY clicks DESC
      LIMIT 30
    `),

  generationByPromptVersion: () =>
    db.execute(sql/*sql*/`
      SELECT prompt_version,
             COUNT(*)::int AS runs,
             AVG(cost_usd)::float AS avg_cost_usd,
             AVG(latency_ms)::float AS avg_latency_ms
      FROM itineraries
      WHERE prompt_version IS NOT NULL
      GROUP BY prompt_version
      ORDER BY runs DESC
    `),

  slaCompliance: () =>
    db.execute(sql/*sql*/`
      SELECT
        COUNT(*) FILTER (WHERE status = 'published' AND updated_at <= sla_due_at)::int AS on_time,
        COUNT(*) FILTER (WHERE status = 'published')::int AS total_published,
        COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status='published'), 0)::float AS avg_review_seconds
      FROM itineraries
    `),
};
