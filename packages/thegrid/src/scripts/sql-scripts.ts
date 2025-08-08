import "dotenv/config";
import { pool } from "../db";
import { logger } from "../utils/logger";

/**
 *
 * This is just a test script to run sql commands on the database
 * so we can easily run something using this script
 *
 */
async function run() {
  // await pool.query(`ALTER TABLE habits ADD COLUMN type TEXT DEFAULT 'boolean'`); - some example sql script
  logger.info("✅ Column added successfully");
  await pool.end();
}

run().catch((error) => logger.error("Script execution failed", { error }));
