import { createRoute, z } from "@hono/zod-openapi";
import { createNotificationSchema } from "./validation/notifications";

// Response schemas
const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["alert", "reminder", "insight"]),
  message: z.string(),
  metadata: z.record(z.any()),
  read: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const NotificationsListResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
});

const NotificationCreatedResponseSchema = z.object({
  success: z.boolean(),
  delivered: z.string(),
  notification: NotificationSchema,
});

const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
});

// Route definitions
export const getNotificationsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all notifications for a user",
  description: "Retrieves all unread notifications for a specific user",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      userId: z.string().describe("User ID to fetch notifications for"),
    }),
  },
  responses: {
    200: {
      description: "List of unread notifications",
      content: {
        "application/json": {
          schema: NotificationsListResponseSchema,
        },
      },
    },
    400: {
      description: "Missing user ID parameter",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error fetching notifications",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const markNotificationAsReadRoute = createRoute({
  method: "post",
  path: "/{id}/read",
  summary: "Mark a notification as read",
  description: "Marks a specific notification as read by its ID",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().describe("Notification ID"),
    }),
  },
  responses: {
    200: {
      description: "Notification marked as read",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Missing notification ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error marking notification as read",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const markAllNotificationsAsReadRoute = createRoute({
  method: "post",
  path: "/read-all",
  summary: "Mark all notifications as read",
  description: "Marks all notifications as read for a specific user",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            userId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "All notifications marked as read",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: "Missing user ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error marking all notifications as read",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createNotificationRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create a new notification",
  description: "Creates a new notification and delivers it via SSE if the user is online",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createNotificationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Notification created successfully",
      content: {
        "application/json": {
          schema: NotificationCreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Error creating notification",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});