
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Notification } from "@/type/notification";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notificationService";
import { socket } from "@/socket";

// Helper function for notification links
const getNotificationLink = (notification: Notification) => {
  const combined = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();
  if (combined.includes("leave")) return "/leaves";
  if (combined.includes("task")) return "/tasks";
  if (combined.includes("project")) return "/projects";
  if (combined.includes("member") || combined.includes("user")) return "/members";
  if (combined.includes("attendance")) return "/attendance";
  return "/notifications"; // Fallback to main notifications page
};

const extractUserId = (r: any): string => {
  if (!r) return "";
  if (typeof r === "string") return r;
  if (r.user) {
    if (typeof r.user === "string") return r.user;
    if (r.user._id) return String(r.user._id);
    if (r.user.id) return String(r.user.id);
  }
  if (r.userId) return String(r.userId);
  if (r._id) return String(r._id);
  if (r.id) return String(r.id);
  return "";
};

interface UseNotificationsProps {
  authSlug: string | null;
  currentUserId: string;
}

export const useNotifications = ({ authSlug, currentUserId }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audioRef.current = audio;

    // 🟢 Unlock audio context on first user interaction to prevent Autoplay blocks
    const unlockAudio = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {}); // Ignore silent failure
      
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!authSlug) return;
    
    if (currentUserId) {
      socket.emit("joinUserRoom", currentUserId);
    }

    const fetchNotifs = async () => {
      try {
        const res = await getNotifications(authSlug);
        const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const formatted = rawList.map((n: any) => ({
          id: n._id || n.id,
          title: n.title,
          message: n.message,
          priority: n.priority,
          targetUserIds: (n.recipients || []).map((r: any) => typeof r === "string" ? r : (r._id || r.id || String(r))),
          createdBy: n.createdBy?._id || n.createdBy,
          createdAt: n.createdAt,
          readBy: (n.readBy || []).map(extractUserId).filter(Boolean),
          attachments: n.attachments || [],
          sendTo: n.sendTo || "all",
        }));
        setNotifications(formatted);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifs();

    const handleNewNotification = (data: any) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      const newNotif: Notification = {
        id: data._id || data.id || Math.random().toString(),
        title: data.title || data.action || "New Notification",
        message: data.message,
        priority: data.priority || "normal",
        targetUserIds: (data.recipients || []).map((r: any) => typeof r === "string" ? r : (r._id || r.id || String(r))),
        createdBy: data.createdBy?._id || data.createdBy || "system",
        createdAt: data.createdAt || new Date().toISOString(),
        readBy: (data.readBy || []).map(extractUserId).filter(Boolean),
        attachments: data.attachments || [],
        sendTo: data.sendTo || "all",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [authSlug, currentUserId]);

  const visibleNotifications = notifications.filter((n) => {
    const isTarget =
      n.sendTo === "all" ||
      !n.targetUserIds ||
      n.targetUserIds.length === 0 ||
      (currentUserId ? n.targetUserIds.includes(currentUserId) : true);
    const isRead = currentUserId ? n.readBy.includes(currentUserId) : false;
    return isTarget && !isRead;
  });

  const unreadCount = visibleNotifications.length;

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && currentUserId && !n.readBy.includes(currentUserId)
          ? { ...n, readBy: [...n.readBy, currentUserId] }
          : n
      )
    );
    try {
      if (authSlug) {
        await markAsRead(authSlug, id);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;

    // Optimistically mark all notifications as read
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        readBy: n.readBy.includes(currentUserId) ? n.readBy : [...n.readBy, currentUserId],
      }))
    );

    try {
      if (authSlug) await markAllAsRead(authSlug);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  return {
    notifications,
    visibleNotifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    getNotificationLink,
    navigate, // Expose navigate for use in JSX
  };
};
