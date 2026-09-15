import type { FastifyInstance } from "fastify";
import { pool } from "../../db/client";

export async function registerHealth(app: FastifyInstance) {
  app.get("/health", async () => {
    let dbOk = false;
    try {
      await pool.query("select 1");
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return { status: "ok", db: dbOk, ts: new Date().toISOString() };
  });
}
