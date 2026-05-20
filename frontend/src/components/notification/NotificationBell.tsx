import { MdNotifications } from "react-icons/md";
import type { Notification } from "@/types/notification";

interface Props {
  notifications: Notification[];
  currentUserId: string;
  setNotifications: React.Dispatch<
    React.SetStateAction<Notification[]>
  >;
}

export default function NotificationBell({
  notifications,
  currentUserId,
  setNotifications,
}: Props) {
  const visibleNotifications = notifications.filter(
    (n) =>
      n.targetUserIds.length === 0 ||
      n.targetUserIds.includes(currentUserId)
  );

  const unreadCount = visibleNotifications.filter(
    (n) => !n.readBy.includes(currentUserId)
  ).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              readBy: [...n.readBy, currentUserId],
            }
          : n
      )
    );
  };

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-circle relative"
      >
        <MdNotifications size={22} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 badge badge-error badge-xs">
            {unreadCount}
          </span>
        )}
      </label>

      <div className="dropdown-content mt-3 w-80 bg-base-100 shadow-lg rounded-xl border border-base-300 p-3 space-y-2 max-h-96 overflow-y-auto">

        {visibleNotifications.length === 0 && (
          <p className="text-xs text-base-content/60">
            No notifications
          </p>
        )}

        {visibleNotifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`p-3 rounded-lg border cursor-pointer transition
              ${
                n.readBy.includes(currentUserId)
                  ? "bg-base-100"
                  : "bg-base-200"
              }`}
          >
            <p className="text-sm font-semibold">
              {n.title}
            </p>
            <p className="text-xs text-base-content/60">
              {n.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
