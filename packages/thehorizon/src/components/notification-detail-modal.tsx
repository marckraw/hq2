import { format } from "date-fns";
import { Check } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { DetailModal } from "@/components/ui/detail-modal";

interface NotificationDetailModalProps {
  notification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (notification: Notification) => void;
}

export function NotificationDetailModal({
  notification,
  onClose,
  onMarkAsRead,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-500";
      case "reminder":
        return "bg-yellow-500";
      case "insight":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification);
  };

  return (
    <DetailModal
      isOpen={!!notification}
      onClose={onClose}
      title="Notification Details"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge
            className={`${getTypeColor(
              notification.type
            )} text-white capitalize`}
          >
            {notification.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(new Date(notification.createdAt), "PPpp")}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Message</h3>
          <p className="text-sm">{notification.message}</p>
        </div>

        {notification.metadata &&
          Object.keys(notification.metadata).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Additional Information</h3>
              <div className="rounded-md bg-muted p-3">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="font-medium capitalize">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="space-y-2">
          <h3 className="font-medium">Status</h3>
          <Badge variant={notification.read ? "secondary" : "default"}>
            {notification.read ? "Read" : "Unread"}
          </Badge>
        </div>

        <DialogFooter>
          <Button onClick={handleMarkAsRead} disabled={notification.read}>
            <Check className="mr-2 h-4 w-4" />
            Mark as Read
          </Button>
        </DialogFooter>
      </div>
    </DetailModal>
  );
}
