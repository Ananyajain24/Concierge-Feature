import { runWorker } from "./runner.js";

runWorker().catch((e) => {
  console.error(e);
  process.exit(1);
});
