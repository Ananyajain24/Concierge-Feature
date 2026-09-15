// Seed entrypoint — dispatches to per-destination seed scripts.
// Currently only Goa is seeded for the MVP.
import { pool } from "../client";
import { seedGoa } from "./goa";

async function main() {
  console.log("→ Seeding Goa…");
  await seedGoa();
  console.log("✓ Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
