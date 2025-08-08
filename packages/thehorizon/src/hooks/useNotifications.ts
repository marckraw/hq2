import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useStream } from "@/providers/stream-provider";

export type Notification = {
  id: string;
  userId: string;
  type: "alert" | "reminder" | "insight";
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  read: boolean;
};

// API functions
const fetchNotificationsApi = async (
  userId: string
): Promise<Notification[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications?userId=${userId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const data = await res.json();
  return data.notifications;
};

const markAsReadApi = async (notificationId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/${notificationId}/read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return res.json();
};

const markAllAsReadApi = async (userId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/read-all`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GC_API_KEY}`,
      },
      body: JSON.stringify({ userId }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  return res.json();
};

export const useNotifications = (userId: string = "") => {
  const queryClient = useQueryClient();

  // Query for fetching notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotificationsApi(userId),
    enabled: !!userId,
  });

  // Mutation for marking as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: (_, notificationId) => {
      // Update the notifications in the cache
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          );
        }
      );
    },
  });

  // Mutation for marking all as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => markAllAsReadApi(userId),
    onSuccess: () => {
      // Update all notifications in the cache to be marked as read
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((n) => ({ ...n, read: true }));
        }
      );
    },
  });

  // Calculate unread count
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  // Listen for real-time notifications
  const { addMessageListener } = useStream();

  useEffect(() => {
    const removeListener = addMessageListener((event) => {
      if (event.type === "notification") {
        // Add new notification to the cache
        queryClient.setQueryData<Notification[]>(
          ["notifications", userId],
          (oldData = []) => {
            const newNotification: Notification = {
              id: crypto.randomUUID(), // Server will assign real ID
              userId: userId,
              type: event.metadata?.notificationType || "alert",
              message: event.content,
              metadata: event.metadata,
              createdAt: new Date(),
              read: false,
            };
            return [newNotification, ...oldData];
          }
        );
      }
    });

    return () => removeListener();
  }, [addMessageListener, queryClient, userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  };
};
