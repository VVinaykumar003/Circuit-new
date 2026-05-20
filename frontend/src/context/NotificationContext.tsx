import { createContext, useContext, useState } from "react";

import type { Notification } from "@/type/notification";

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "createdAt">
  ) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const addNotification = (
    notification: Omit<
      Notification,
      "id" | "read" | "createdAt"
    >
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return context;
};