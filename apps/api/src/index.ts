import { buildServer } from "./server.js";
import { loadEnv } from "./config/env.js";

const env = loadEnv();

async function main() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(`API listening on ${env.API_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
