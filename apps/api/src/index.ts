import { buildServer } from "./server.js";
import { loadEnv } from "./config/env.js";
import { runWorker } from "./workers/runner.js";

const env = loadEnv();

async function main() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(`API listening on ${env.API_PORT}`);
    // Run the polling worker in-process. In production it can be a separate
    // deployment; for MVP one process is enough.
    runWorker((m) => app.log.info(m)).catch((err) => app.log.error(err));
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
