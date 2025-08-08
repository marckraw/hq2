import pino from "pino";
import pretty from "pino-pretty";
import { config } from "../config.env";
import { userOnlyLogger } from "../middleware/pino-logger";

// Define custom levels for application logging
const customLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  user: 35, // Custom user-defined level
  info: 30,
  debug: 20,
  trace: 10,
};

// Create a shared Pino instance for application logging
const pinoInstance = pino(
  {
    level: config.NODE_ENV === "test" ? "silent" : (config.LOG_LEVEL || "info"),
    customLevels,
    useOnlyCustomLevels: false,
  },
  config.NODE_ENV === "production"
    ? undefined
    : config.NODE_ENV === "test"
    ? undefined
    : pretty({
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      })
);

/**
 * Main application logger with all standard levels plus custom "user" level
 * Use this for general application logging
 */
export const logger = {
  trace: (message: string, data?: unknown) => pinoInstance.trace(data, message),
  debug: (message: string, data?: unknown) => pinoInstance.debug(data, message),
  info: (message: string, data?: unknown) => pinoInstance.info(data, message),
  user: (message: string, data?: unknown) => pinoInstance.user(data, message),
  warn: (message: string, data?: unknown) => pinoInstance.warn(data, message),
  error: (message: string, data?: unknown) => pinoInstance.error(data, message),
  fatal: (message: string, data?: unknown) => pinoInstance.fatal(data, message),

  // Convenience methods for common patterns
  http: (message: string, data?: unknown) =>
    pinoInstance.info(data, `[HTTP] ${message}`),
  db: (message: string, data?: unknown) =>
    pinoInstance.debug(data, `[DB] ${message}`),
  security: (message: string, data?: unknown) =>
    pinoInstance.warn(data, `[SECURITY] ${message}`),
  perf: (message: string, data?: unknown) =>
    pinoInstance.debug(data, `[PERF] ${message}`),
};

/**
 * User-only logger - ONLY shows when LOG_LEVEL=user
 * Use this for isolated debugging when you want to filter out all system noise
 */
export const userLogger = {
  log: (message: string, data?: unknown) => userOnlyLogger.user(data, message),
  debug: (message: string, data?: unknown) =>
    userOnlyLogger.user(data, `[DEBUG] ${message}`),
  info: (message: string, data?: unknown) =>
    userOnlyLogger.user(data, `[INFO] ${message}`),
  warn: (message: string, data?: unknown) =>
    userOnlyLogger.user(data, `[WARN] ${message}`),
  error: (message: string, data?: unknown) =>
    userOnlyLogger.user(data, `[ERROR] ${message}`),
};

/**
 * Utility functions
 */
export const getLogLevel = () => config.LOG_LEVEL || "info";

export const isLevelEnabled = (level: keyof typeof customLevels) => {
  const currentLevel =
    customLevels[getLogLevel() as keyof typeof customLevels] ||
    customLevels.info;
  const checkLevel = customLevels[level];
  return checkLevel >= currentLevel;
};
