import { Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import type { Notification } from "@/hooks/useNotifications";
import { FluidLoader } from "@/components/horizon/fluid-loader";

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationDropdownProps) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <Card className="absolute right-0 mt-2 w-96 p-4 shadow-lg z-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <FluidLoader size="sm" message="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No notifications
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg cursor-pointer relative group"
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex-1">
                  <p
                    className={
                      notification.read
                        ? "text-muted-foreground"
                        : "font-medium"
                    }
                  >
                    {notification.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMarkAsRead(notification);
                    }}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as Read</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
