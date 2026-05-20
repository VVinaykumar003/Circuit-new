import { useState } from "react";
import { MdNotifications } from "react-icons/md";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    markAsRead,
    clearAll,
  } = useNotifications();

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <MdNotifications size={24} />

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-white text-xs px-2 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-base-100 border border-base-300 rounded-xl shadow-lg z-50">
          <div className="p-4 border-b font-semibold flex justify-between">
            Notifications
            <button
              onClick={clearAll}
              className="text-xs text-error"
            >
              Clear
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-base-content/60">
                No notifications
              </p>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 border-b text-sm cursor-pointer ${
                  !n.read
                    ? "bg-primary/10"
                    : ""
                }`}
              >
                <p className="font-medium">
                  {n.title}
                </p>
                <p className="text-base-content/70">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}