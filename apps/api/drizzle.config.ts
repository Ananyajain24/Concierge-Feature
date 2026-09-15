import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://lohono:lohono@localhost:5432/lohono",
  },
  strict: true,
  verbose: true,
} satisfies Config;
