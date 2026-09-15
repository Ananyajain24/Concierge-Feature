// Seed entrypoint — dispatches to per-destination seed scripts.
// Currently only Goa is seeded for the MVP.
import { seedGoa } from "./goa.js";

async function main() {
  console.log("→ Seeding Goa…");
  await seedGoa();
  console.log("✓ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
