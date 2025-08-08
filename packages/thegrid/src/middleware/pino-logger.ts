import { logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";
import { config } from "../config.env";

// Define custom log levels including our special "user" level
const customLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  user: 35, // Custom user-defined level between warn and info
  info: 30,
  debug: 20,
  trace: 10,
};

/**
 * Create the appropriate Pino logger middleware based on environment and log level
 */
export function createLoggerMiddleware() {
  const logLevel = config.LOG_LEVEL.toLowerCase();

  // Special case: test environment - completely silent
  if (config.NODE_ENV === "test") {
    return async (_c: any, next: any) => {
      await next();
    };
  }

  // Special case: user-only logging mode - completely silent middleware
  if (logLevel === "user") {
    // Direct console.log that we want to keep
    console.log("🔵 User-only logging mode - suppressing all system logs");
    return async (_c: any, next: any) => {
      // Completely silent - no HTTP logging at all
      await next();
    };
  }

  // Determine the appropriate log level and formatting
  const shouldUsePretty = config.NODE_ENV !== "production";
  let effectiveLevel = logLevel;

  // Smart defaults based on environment
  if (config.NODE_ENV === "development" && logLevel === "info") {
    effectiveLevel = "debug"; // More verbose in development
  } else if (config.NODE_ENV === "production" && logLevel === "info") {
    effectiveLevel = "warn"; // Less verbose in production
  }

  return logger({
    pino: pino(
      {
        level: effectiveLevel,
      },
      shouldUsePretty
        ? pretty({
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          })
        : undefined
    ),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}

/**
 * Standalone user logger with custom levels - for user-defined logs only
 * This is completely separate from the HTTP middleware logging
 */
export const userOnlyLogger = pino(
  {
    level: config.NODE_ENV === "test" ? "silent" : "user",
    customLevels,
    useOnlyCustomLevels: false,
  },
  config.NODE_ENV === "test"
    ? undefined
    : pretty({
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "🔵 [USER] {msg}",
      })
);

/**
 * Check if HTTP request logging should be enabled
 * Only enable for trace/debug levels to avoid noise
 */
export function shouldEnableHttpLogging(): boolean {
  const logLevel = config.LOG_LEVEL.toLowerCase();
  return logLevel === "trace" || logLevel === "debug";
}
