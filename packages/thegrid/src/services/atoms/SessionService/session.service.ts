import { drizzle } from "drizzle-orm/node-postgres";
import { eq, lt, gt, count } from "drizzle-orm";
import { sessions, SessionData } from "../../../db/schema/sessions";
import { pool } from "../../../db";
import { logger } from "@/utils/logger";

export const createSessionService = () => {
  const CLEANUP_INTERVAL_MS = 1000 * 60 * 60; // Run every 1 hour
  let cleanupInterval: ReturnType<typeof setInterval> | null = null;
  // Initialize Drizzle
  const db = drizzle(pool);

  // Create a new session
  const createSession = async (
    token: string,
    data: SessionData,
    expiresAt: Date
  ) => {
    logger.db("createSession: This is session data to save", { data });
    logger.db("createSession: Inserting into database...");

    try {
      const [session] = await db
        .insert(sessions)
        .values({
          token,
          data,
          expiresAt,
        })
        .returning();

      logger.db("Return from db", { session });

      // Let's also try to immediately query it back to verify it was saved
      logger.db(
        "createSession: Attempting to retrieve the session we just created..."
      );
      const verification = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

      logger.db("createSession: Verification query result", { verification });

      return session;
    } catch (error) {
      logger.error("createSession: Database error", { error });
      throw error;
    }
  };

  // Get session by token
  const getSession = async (token: string): Promise<SessionData | null> => {
    logger.db("getSession: Looking for token", { token });

    try {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

      logger.db("getSession: Found session", { session });

      if (!session) {
        logger.db("getSession: No session found");
        return null;
      }

      // Check if session is expired
      // if (new Date() > session.expiresAt) {
      //   logger.db("getSession: Session expired, cleaning up");
      //   // Clean up expired session
      //   await deleteSession(token);
      //   return null;
      // }

      logger.db("getSession: Returning session data");
      return session.data as SessionData;
    } catch (error) {
      logger.error("getSession: Database error", { error });
      throw error;
    }
  };

  // Delete a specific session
  const deleteSession = async (token: string) => {
    logger.db("deleteSession: Deleting token", { token });
    try {
      const result = await db.delete(sessions).where(eq(sessions.token, token));
      logger.db("deleteSession: Delete result", { result });
      return result;
    } catch (error) {
      logger.error("deleteSession: Database error", { error });
      throw error;
    }
  };

  // Clean up all expired sessions (can be run periodically)
  const cleanupExpiredSessions = async () => {
    const now = new Date();
    logger.db("cleanupExpiredSessions: Running cleanup at", { timestamp: now });

    try {
      const result = await db
        .delete(sessions)
        .where(lt(sessions.expiresAt, now))
        .returning({ token: sessions.token });

      logger.info(`Cleaned up ${result.length} expired sessions`, {
        count: result.length,
      });
      return result.length;
    } catch (error) {
      logger.error("cleanupExpiredSessions: Database error", { error });
      throw error;
    }
  };

  // Get session count (for monitoring)
  const getActiveSessionCount = async () => {
    try {
      const now = new Date();
      const [result] = await db
        .select({ count: count() })
        .from(sessions)
        .where(gt(sessions.expiresAt, now));

      logger.db("getActiveSessionCount: Active sessions", {
        count: result?.count || 0,
      });
      return result?.count || 0;
    } catch (error) {
      logger.error("getActiveSessionCount: Database error", { error });
      throw error;
    }
  };

  // Extend session expiration by 5 minutes
  const extendSession = async (token: string) => {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes from now
    logger.db("extendSession: Extending token", { token, newExpiresAt });

    try {
      const result = await db
        .update(sessions)
        .set({ expiresAt: newExpiresAt })
        .where(eq(sessions.token, token))
        .returning({ token: sessions.token });

      logger.db("extendSession: Extension result", { result });
      return result.length > 0;
    } catch (error) {
      logger.error("extendSession: Database error", { error });
      throw error;
    }
  };

  const startCleanup = () => {
    if (cleanupInterval) {
      logger.info("Session cleanup already running");
      return;
    }

    logger.info("Starting session cleanup service (runs every 1 hour)");

    // Run cleanup immediately
    sessionService.cleanupExpiredSessions();

    // Then run periodically
    cleanupInterval = setInterval(async () => {
      try {
        await sessionService.cleanupExpiredSessions();
      } catch (error) {
        logger.error("Session cleanup error", { error });
      }
    }, CLEANUP_INTERVAL_MS);
  };

  const stopCleanup = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
      logger.info("Session cleanup service stopped");
    }
  };

  const getCleanupStatus = () => {
    return {
      isRunning: cleanupInterval !== null,
      intervalMs: CLEANUP_INTERVAL_MS,
    };
  };

  // Return public interface
  return {
    createSession,
    getSession,
    deleteSession,
    cleanupExpiredSessions,
    getActiveSessionCount,
    extendSession,
    startCleanup,
    stopCleanup,
    getCleanupStatus,
  };
};

export const sessionService = createSessionService();
export type SessionService = ReturnType<typeof createSessionService>;
