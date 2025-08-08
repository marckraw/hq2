import { logger, userLogger, getLogLevel } from "../utils/logger";

/**
 * Simple logging examples for the HQ logging system
 *
 * Log Levels: trace(10) < debug(20) < info(30) < user(35) < warn(40) < error(50) < fatal(60)
 *
 * Key Features:
 * - Set LOG_LEVEL=user to see ONLY your debugging logs
 * - Set LOG_LEVEL=debug for verbose development logging
 * - Set LOG_LEVEL=warn for production (warnings and errors only)
 */

export function demonstrateLogging() {
  logger.info(`\n🔧 Current log level: ${getLogLevel()}\n`);

  // Standard application logging
  logger.trace("Function entry", { fn: "demonstrateLogging" });
  logger.debug("Processing request", { userId: "123", action: "getData" });
  logger.info("User action completed", { userId: "123", duration: "45ms" });
  logger.warn("Rate limit approaching", { requests: 95, limit: 100 });
  logger.error("Database query failed", { error: "Connection timeout" });
  logger.fatal("System shutdown", { reason: "Out of memory" });

  // 🔵 Special user-only logging - only shows when LOG_LEVEL=user
  logger.user("🔵 This is MY debugging log", { customData: "important info" });
}

export function demonstrateUserOnlyLogging() {
  logger.info("\n🔵 USER-ONLY LOGGING (set LOG_LEVEL=user to see these):\n");

  // These ONLY show when LOG_LEVEL=user - completely isolated
  userLogger.log("Starting my debugging session");
  userLogger.debug("Checking authentication", { userId: "test123" });
  userLogger.info("Processing business logic", { step: "validation" });
  userLogger.warn("Something suspicious", { attempts: 3 });
  userLogger.error("My custom error", { code: "CUSTOM_001" });
}

export function showUsageExamples() {
  logger.info(`
🚀 QUICK USAGE GUIDE:

1. 🔵 USER-ONLY MODE (your debugging only):
   LOG_LEVEL=user
   
2. 📊 DEVELOPMENT (see everything):
   LOG_LEVEL=debug

3. 📱 PRODUCTION (warnings+ only):
   LOG_LEVEL=warn

4. 🎯 CUSTOM DEBUGGING:
   logger.user("My debug message", { data });
   userLogger.log("Isolated debug message");
  `);
}
