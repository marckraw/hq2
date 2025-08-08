import { logger } from "@/utils/logger";
import { db } from "../../../db";
import { notifications } from "../../../db/schema/notifications";
import { streamManager } from "../../../services/atoms/StreamManagerService/stream.manager.service";
import { v4 as uuidv4 } from "uuid";
import { eq, and, desc } from "drizzle-orm";
import {
  type CreateNotificationInput as _CreateNotificationInput,
  type NotificationData as _NotificationData,
  type MaybeNotifyUserInput as _MaybeNotifyUserInput,
  CreateNotificationInputSchema,
  MaybeNotifyUserInputSchema,
} from "../../../schemas/services.schemas";

const createNotificationService = () => {
  // Public methods
  const createNotification = async (
    userId: string,
    data: {
      type: "alert" | "reminder" | "insight";
      message: string;
      metadata?: Record<string, any>;
    }
  ) => {
    // Validate input
    const validatedInput = CreateNotificationInputSchema.parse({
      userId,
      data,
    });

    const newNotification = {
      id: uuidv4(),
      userId: validatedInput.userId,
      type: validatedInput.data.type,
      message: validatedInput.data.message,
      metadata: validatedInput.data.metadata || {},
      createdAt: new Date(),
      read: false,
    };

    await db.insert(notifications).values(newNotification);
    return newNotification;
  };

  // Get all notifications for debugging
  const getAllNotifications = async (userId: string) => {
    try {
      const results = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));

      return results;
    } catch (error) {
      logger.error("Error getting all notifications:", error);
      throw error;
    }
  };

  const getUnreadNotifications = async (userId: string) => {
    return await db
      .select()
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      )
      .orderBy(desc(notifications.createdAt));
  };

  const markAsRead = async (notificationId: string) => {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  };

  const markAllAsRead = async (userId: string) => {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  };

  // 💬 Maybe notify user (push or store)
  const maybeNotifyUser = async (
    userId: string,
    data: {
      type: "alert" | "reminder" | "insight";
      message: string;
      metadata?: Record<string, any>;
    }
  ) => {
    // Validate input
    const validatedInput = MaybeNotifyUserInputSchema.parse({
      userId,
      data,
    });

    if (streamManager.isStreamActive(validatedInput.userId)) {
      // User is online → push into live SSE stream
      streamManager.sendToUser(validatedInput.userId, {
        type: "notification",
        content: validatedInput.data.message,
        metadata: {
          notificationType: validatedInput.data.type,
          ...validatedInput.data.metadata,
        },
      });
    }

    // deliver to notification service anyway
    await createNotification(validatedInput.userId, {
      type: validatedInput.data.type,
      message: validatedInput.data.message,
      ...(validatedInput.data.metadata && {
        metadata: validatedInput.data.metadata,
      }),
    });
  };

  // Return public interface
  return {
    createNotification,
    getUnreadNotifications,
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    maybeNotifyUser,
  };
};

export const notificationService = createNotificationService();

// Export the type for the service registry
export type NotificationService = typeof notificationService;
