// Real Goa seed lands in M1. For M0 this is a placeholder that returns
// without touching the DB so `pnpm db:seed` never fails on a clean db.
export async function seedGoa(): Promise<void> {
  console.log("  (M0 placeholder — real POI seed arrives in M1)");
}
