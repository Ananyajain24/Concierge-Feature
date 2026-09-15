import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};

envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && !key.startsWith("#")) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const dbUrl = env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in .env");
  process.exit(1);
}

const url = new URL(dbUrl);
const adminUrl = `postgres://${url.username}:${url.password}@${url.hostname}:${url.port}/postgres`;

async function setupDatabase() {
  const client = new pg.Client(adminUrl);

  try {
    console.log("🔗 Connecting to PostgreSQL...");
    await client.connect();

    console.log("📁 Creating database 'lohono'...");
    try {
      await client.query(`DROP DATABASE IF EXISTS lohono;`);
    } catch (e) {
      // ignore
    }
    await client.query(`CREATE DATABASE lohono;`);

    console.log("✅ Database 'lohono' created successfully!");
    console.log("\n🚀 Now run: pnpm db:push");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
