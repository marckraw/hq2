// src/db/index.ts

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { logger } from "../utils/logger";

// Create a pool using your Railway connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // railway is handling ssl at proxy level ?
  ssl: false,
  // Railway PostgreSQL specific configuration
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

// Add connection error handling
pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", { error: err });
  process.exit(-1);
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    logger.error("Error acquiring client", { error: err.stack });
  } else {
    logger.info("✅ Database connected successfully");
    if (client) {
      release();
    }
  }
});

// Pass the pool into Drizzle
export const db = drizzle(pool);

// Optional: export the pool too, in case you need raw SQL access somewhere
export { pool };
