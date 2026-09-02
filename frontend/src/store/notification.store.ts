import { useState, useCallback } from "react";
import type { Notification } from "@/type/notification";

export const useNotificationStore = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const updateNotifications = useCallback((items: Notification[]) => {
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.isRead).length);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    updateNotifications,
    markRead,
    markAllRead,
  };
};
