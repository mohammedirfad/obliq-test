import { readFileSync, existsSync } from "node:fs";
import { Pool } from "pg";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
} else if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local, .env, or your shell environment.");
  process.exit(1);
}

const schema = readFileSync("db/neon-schema.sql", "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  await pool.query(schema);
  console.log("Neon schema initialized successfully.");
} finally {
  await pool.end();
}
