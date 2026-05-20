import { useState, useEffect } from "react";
import type { Notification } from "@/type/notification";
import { Trash2 } from "lucide-react";
import { MdAttachFile, MdEdit, MdOpenInNew, MdNotificationsNone } from "react-icons/md";

interface Props {
  notifications: Notification[];
  currentUserId: string;
  currentUserRole: string;
  onEdit: (notification: Notification) => void;
  onDelete: (id: string) => void;
}

export default function NotificationPage({
  notifications,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
}: Props) {
  const canManage = ["admin", "owner"].includes(currentUserRole);
  const visibleNotifications = notifications.filter((n) => {
    const targets = n.targetUserIds ?? [];

    return (
      n.createdBy === currentUserId || // sender always see
      targets.length === 0 || // no target = all
      targets.includes(currentUserId) || // specific user
      n.sendTo === "all" //
    );
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the first notification when the list loads or updates
  useEffect(() => {
    if (visibleNotifications.length > 0 && !selectedId) {
      setSelectedId(visibleNotifications[0].id);
    } else if (visibleNotifications.length === 0) {
      setSelectedId(null);
    }
  }, [visibleNotifications, selectedId]);

  const selectedNotif = visibleNotifications.find((n) => n.id === selectedId) || visibleNotifications[0];

  if (visibleNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-base-100 border border-base-300 rounded-2xl shadow-sm text-base-content/60">
        <MdNotificationsNone size={42} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">No Notifications Yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 w-full   lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: LIST VIEW */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 overflow-y-auto max-h-[40vh] lg:max-h-[70vh]   pr-1 sm:pr-2">
        {visibleNotifications.map((n) => {
          const isSelected = n.id === selectedNotif?.id;
          const isUnread = !n.readBy.includes(currentUserId);

          return (
            <button
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? "border-primary bg-primary/20 ring-1 ring-primary/20 shadow-md"
                  : "border-primary/30 bg-base-100 hover:bg-base-200/50  shadow-md hover:border-base-content/20"
              } ${
                n.priority === "urgent" && !isSelected ? "border-l-4 border-l-error" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-1 gap-2">
                <h4 className={`font-bold text-lg truncate ${isUnread ? "text-base-content" : "text-base-content"}`}>
                  {n.title}
                </h4>
                {isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </div>
              <p className="text-md text-base-content line-clamp-2 leading-relaxed">
                {n.message}
              </p>
              <p className="text-[13px] text-base-content mt-3 font-medium uppercase tracking-wider">
                {new Date(n.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            </button>
          );
        })}
      </div>

      {/* RIGHT COLUMN: PREVIEW PANE */}
      <div className="lg:col-span-7 xl:col-span-8    bg-primary border border-primary/20 rounded-2xl p-6 shadow-md min-h-[50vh] flex flex-col lg:sticky lg:top-6">
        {selectedNotif ? (
          <>
            <div className="flex justify-between items-start border-b border-base-300 pb-4 mb-4 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-bold text-primary-content leading-tight">{selectedNotif.title}</h2>
                  {selectedNotif.priority === "urgent" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error/10 text-error border border-error/20 shrink-0">
                      Urgent
                    </span>
                  )}
                  </div>
                <p className="text-sm text-primary-content/70 font-medium">
                  {new Date(selectedNotif.createdAt).toLocaleString("en-IN", {
                    weekday: "long", day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>

              {canManage && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEdit(selectedNotif)}
                    className="p-2 rounded-lg bg-base-100 hover:bg-base-200 text-base-content/70 hover:text-base-content transition"
                    title="Edit"
                  >
                    <MdEdit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      onDelete(selectedNotif.id);
                      if (selectedId === selectedNotif.id) setSelectedId(null);
                    }}
                    className="p-2 rounded-lg bg-error/70 hover:bg-error/80 text-white transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-[15px] text-primary-content/70 leading-relaxed whitespace-pre-wrap">
                {selectedNotif.message}
              </p>
            </div>

            {selectedNotif.attachments?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-base-200">
                <h4 className="text-xs font-semibold text-primary-content/50 uppercase tracking-wider mb-3">Attachments</h4>
                <a
                  href={selectedNotif.attachments[0].fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-base-200 border border-base-300 rounded-xl px-4 py-3 hover:bg-base-300 transition group max-w-sm w-full"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-base-100 text-base-content/70 shadow-sm shrink-0">
                    <MdAttachFile size={20} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-base-content truncate">
                      {selectedNotif.attachments[0].fileName || "Attached File"}
                    </span>
                    <span className="text-xs text-base-content/50">
                      Click to view
                    </span>
                  </div>
                  <MdOpenInNew size={18} className="text-base-content/40 group-hover:text-base-content transition shrink-0" />
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-base-content/40">
            <p>Select a notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
