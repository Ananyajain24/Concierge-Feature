import { runWorker } from "./runner";

runWorker().catch((e) => {
  console.error(e);
  process.exit(1);
});
