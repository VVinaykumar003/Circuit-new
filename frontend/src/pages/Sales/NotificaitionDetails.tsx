import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdCheckCircle,
  MdDelete,
  MdArrowBack,
  MdWarning,
  MdSchedule,
  MdPerson,
  MdLabel,
  MdPriorityHigh,
  MdOpenInNew,
} from "react-icons/md";
import { useAuth } from "@/auth/AuthContext";
import {
  getNotificationById,
  markAsRead,
  deleteNotification,
  type Notification,
} from "@/services/notificationServices";
import { toast } from "react-toastify";

/* ─────────────────────────── helpers ─────────────────────────── */
const priorityBadge = (priority?: string) => {
  switch (priority) {
    case "Urgent":
      return "badge-error";
    case "High":
      return "badge-warning";
    case "Low":
      return "badge-ghost";
    default:
      return "badge-info";
  }
};

const typeBadge = (type?: string) => {
  switch (type) {
    case "Task":
      return "badge-primary";
    case "Order":
      return "badge-secondary";
    case "Lead":
      return "badge-accent";
    default:
      return "badge-neutral";
  }
};

const formatDateTime = (date?: string) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ═══════════════════════════ component ═══════════════════════════ */
export default function NotificationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const slug = auth?.slug || "default-tenant";
  const queryClient = useQueryClient();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  /* ── fetch notification ── */
  const {
    data: notification,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notification", slug, id],
    queryFn: async () => getNotificationById(slug, id!),
    enabled: !!id,
  });

  /* ── mark as read on mount / view ── */
  const readMutation = useMutation({
    mutationFn: (notifId: string) => markAsRead(slug, notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", slug, id] });
    },
  });

  React.useEffect(() => {
    if (notification && !notification.isRead) {
      readMutation.mutate(notification._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?._id]);

  /* ── delete ── */
  const deleteMutation = useMutation({
    mutationFn: (notifId: string) => deleteNotification(slug, notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteModalOpen(false);
      setSuccessModalOpen(true);
    } catch (error) {
      toast.error("Failed to delete notification.");
      console.error("Delete Error:", error);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate("/sales/notifications");
  };

  /* ── loading state ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-9 w-32 bg-base-300 rounded-lg animate-pulse" />
          <div className="h-48 bg-base-300 rounded-2xl animate-pulse" />
          <div className="h-32 bg-base-300 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── error / not found state ── */
  if (isError || !notification) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6 text-center">
        <MdWarning size={56} className="text-warning/50 mb-4" />
        <h2 className="text-xl font-bold text-base-content">
          Notification not found
        </h2>
        <p className="text-sm text-base-content/60 mt-1 mb-6">
          This notification may have been deleted or doesn't exist.
        </p>
        <button
          onClick={() => navigate("/sales/notifications")}
          className="btn btn-primary btn-sm gap-2"
        >
          <MdArrowBack size={16} />
          Back to notifications
        </button>
      </div>
    );
  }

  const n: Notification = notification;

  /* ── main render ── */
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate("/sales/notifications")}
          className="btn btn-ghost btn-sm gap-2 mb-5 -ml-2"
        >
          <MdArrowBack size={18} />
          Back to notifications
        </button>

        {/* ── Header card ── */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-base-200 bg-base-200/30">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge badge-sm font-semibold ${typeBadge(n.type)}`}>
                <MdLabel size={12} className="mr-1" />
                {n.type}
              </span>
              <span className={`badge badge-sm badge-outline ${priorityBadge(n.priority)}`}>
                <MdPriorityHigh size={12} className="mr-1" />
                {n.priority} Priority
              </span>
              {n.isRead ? (
                <span className="badge badge-sm badge-success badge-outline gap-1">
                  <MdCheckCircle size={12} />
                  Read
                </span>
              ) : (
                <span className="badge badge-sm badge-primary gap-1">
                  Unread
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-base-content leading-tight">
              {n.title}
            </h1>

            <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1.5">
              <MdSchedule size={14} />
              {formatDateTime(n.createdAt)}
            </p>
          </div>

          {/* ── Message body ── */}
          <div className="p-6 space-y-6">
            <div className="bg-base-200/50 p-5 rounded-xl border border-base-200">
              <p className="text-sm text-base-content whitespace-pre-wrap leading-relaxed">
                {n.message}
              </p>
            </div>

            {/* ── Meta grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-base-100 border border-base-200 p-4 rounded-xl">
                <p className="text-xs text-base-content/50 uppercase font-bold mb-1.5 flex items-center gap-1">
                  <MdPerson size={14} />
                  Sender
                </p>
                <p className="font-semibold text-base-content">{n.createdBy || "System"}</p>
              </div>

              <div className="bg-base-100 border border-base-200 p-4 rounded-xl">
                <p className="text-xs text-base-content/50 uppercase font-bold mb-1.5">
                  Recipient Type
                </p>
                <p className="font-semibold text-base-content">
                  {n.recipientType || "—"}
                </p>
              </div>

              <div className="bg-base-100 border border-base-200 p-4 rounded-xl">
                <p className="text-xs text-base-content/50 uppercase font-bold mb-1.5">
                  Status
                </p>
                <p className="font-semibold text-success flex items-center gap-1">
                  <MdCheckCircle size={16} />
                  {n.isRead ? "Read" : "Unread"}
                </p>
              </div>

              <div className="bg-base-100 border border-base-200 p-4 rounded-xl">
                <p className="text-xs text-base-content/50 uppercase font-bold mb-1.5">
                  Notification ID
                </p>
                <p className="font-mono text-xs text-base-content/70 truncate">{n._id}</p>
              </div>
            </div>
          </div>

          {/* ── Footer actions ── */}
          <div className="p-5 border-t border-base-200 bg-base-100 flex flex-col sm:flex-row gap-3">
            {n.link && (
              <button
                onClick={() => navigate(n.link!)}
                className="btn btn-primary flex-1 gap-2 shadow-sm"
              >
                <MdOpenInNew size={16} />
                View Related Item
              </button>
            )}
            <button
              className="btn btn-outline btn-error flex-1 gap-2 shadow-sm"
              onClick={() => setDeleteModalOpen(true)}
            >
              <MdDelete size={16} />
              Delete Notification
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2">
            <MdWarning /> Confirm Delete
          </h3>
          <p className="py-4 text-base-content/80">
            Are you sure you want to delete this notification? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-error text-white"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Yes, Delete"
              )}
            </button>
          </div>
        </div>
      </dialog>

      {/* ── Success Modal ── */}
      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Deleted!</h3>
          <p className="text-base-content/80 text-center">
            Notification deleted successfully.
          </p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={handleSuccessClose}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

/* ─────────────────────────── usage ──────────────────────────────

// 1. Add a route in your router:
<Route path="/sales/notifications/:id" element={<NotificationDetails />} />

// 2. Navigate to it from AllNotifications.tsx — replace the side drawer
//    open logic with a route push:
const handleRowClick = (n: Notification) => {
  navigate(`/sales/notifications/${n._id}`);
};

// 3. Add `getNotificationById` to your notificationServices.ts if it
//    doesn't exist yet:
export const getNotificationById = async (slug: string, id: string) => {
  const { data } = await api.get(`/${slug}/notifications/${id}`);
  return data as Notification;
};

──────────────────────────────────────────────────────────────── */