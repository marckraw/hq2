import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import type { Notification } from "@/hooks/useNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDetailModal } from "./notification-detail-modal";
import { useModal } from "@/hooks/useModal";

interface NotificationContextType {
  showNotificationDetail: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { notifications, markAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const modal = useModal();

  const showNotificationDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    modal.open();
  };

  const handleCloseDetailModal = () => {
    modal.close();
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <NotificationContext.Provider value={{ showNotificationDetail }}>
      {children}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={handleCloseDetailModal}
        onMarkAsRead={async (notification) => {
          await markAsRead(notification.id);
          handleCloseDetailModal();
        }}
      />
    </NotificationContext.Provider>
  );
}
