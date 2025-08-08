import { logger } from "@/utils/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { serviceRegistry } from "../../../registry/service-registry";
import { streamManager } from "../../../services/atoms/StreamManagerService/stream.manager.service";
import { serializeRecords, serializeRecord } from "../shared/serializers";
import {
  getNotificationsRoute,
  markNotificationAsReadRoute,
  markAllNotificationsAsReadRoute,
  createNotificationRoute,
} from "./notifications.routes";

const notificationsRouter = new OpenAPIHono();

// Get all notifications for a user
// @ts-expect-error - OpenAPI type inference issue with response union types
notificationsRouter.openapi(getNotificationsRoute, async (c) => {
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "User ID is required as a query parameter" } as const, 400);
  }

  try {
    const notificationService = serviceRegistry.get("notification");
    const notifications =
      await notificationService.getUnreadNotifications(userId);
    
    // Serialize notifications to ensure dates are ISO strings
    const serializedNotifications = serializeRecords(notifications);
    
    return c.json({ notifications: serializedNotifications } as const, 200);
  } catch (error) {
    logger.error("Error fetching notifications:", error);
    return c.json({ error: "Failed to fetch notifications" } as const, 500);
  }
});

// Mark a notification as read
notificationsRouter.openapi(markNotificationAsReadRoute, async (c) => {
  const notificationId = c.req.param("id");

  if (!notificationId) {
    return c.json({ error: "Notification ID is required" } as const, 400);
  }

  try {
    const notificationService = serviceRegistry.get("notification");
    await notificationService.markAsRead(notificationId);
    return c.json({ success: true } as const, 200);
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    return c.json({ error: "Failed to mark notification as read" } as const, 500);
  }
});

// Mark all notifications as read for a user
notificationsRouter.openapi(markAllNotificationsAsReadRoute, async (c) => {
  const { userId } = await c.req.json();

  if (!userId) {
    return c.json({ error: "User ID is required" } as const, 400);
  }

  try {
    const notificationService = serviceRegistry.get("notification");
    await notificationService.markAllAsRead(userId);
    return c.json({ success: true } as const, 200);
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    return c.json({ error: "Failed to mark all notifications as read" } as const, 500);
  }
});

// @ts-expect-error - OpenAPI type inference issue with response union types
notificationsRouter.openapi(createNotificationRoute, async (c) => {
    const data = c.req.valid("json");

    try {
      // Check if user is online
      if (streamManager.isStreamActive(data.userId)) {
        // User is online, send via SSE
        streamManager.sendToUser(data.userId, {
          type: "notification",
          content: data.message,
          metadata: {
            notificationType: data.type,
            ...data.metadata,
          },
        });
      }

      // send to notification service anyway
      const notificationService = serviceRegistry.get("notification");
      const notification = await notificationService.createNotification(
        data.userId,
        {
          type: data.type,
          message: data.message,
          metadata: data.metadata || {},
        } as any
      );

      return c.json({ success: true, delivered: "database", notification: serializeRecord(notification) } as const, 200);
    } catch (error) {
      logger.error("Error creating notification:", error);
      return c.json({ error: "Failed to create notification" } as const, 500);
    }
  }
);

export { notificationsRouter };
