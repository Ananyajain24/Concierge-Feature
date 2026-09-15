import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL;
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
    await client.query(`DROP DATABASE IF EXISTS lohono;`);
    await client.query(`CREATE DATABASE lohono;`);

    console.log("✅ Database created successfully!");
    console.log("\n🚀 Now run: pnpm db:push");
  } catch (error) {
    if (error.code === "23505" || error.toString().includes("already exists")) {
      console.log("✅ Database 'lohono' already exists");
    } else {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

setupDatabase();
