import { useEffect, useState } from "react";
import type { Notification } from "@/type/notification";

import NotificationPage from "@/components/notification/NotificationPages";
import SendNotificationModal from "@/components/notification/SendNotificationModal";

import { MdSend, MdNotificationsNone } from "react-icons/md";
import { getMembers } from "@/services/memberService";
import { useAuth } from "@/auth/AuthContext";
import {
  deleteNotification,
  getNotifications,
} from "@/services/notificationService";
import Swal from "sweetalert2";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);

  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const { auth } = useAuth();
  const formatNotification = (n: any) => ({
    id: n._id,
    title: n.title,
    message: n.message,
    priority: n.priority,
    targetUserIds: n.recipients || [],
    createdBy: n.createdBy?._id,
    createdAt: n.createdAt,
    readBy: n.readBy?.map((r: any) => typeof r === 'string' ? r : (r.user?._id || r.user || r.userId || r._id)) || [],
    attachments: n.attachments || [],
    sendTo: n.sendTo,
  });
  const currentUserId = auth?.user?.userId || "";
  const currentUserRole = auth?.user?.role || "";

  //fetch notifications on component mount
  useEffect(() => {
    if (!auth?.slug || !auth?.user?.userId) return;

    const fetchData = async () => {
      try {
        const slug = auth.slug;

        const [memberRes, notificationRes] = await Promise.all([
          getMembers(slug),
          getNotifications(slug),
        ]);
        // console.log("🔥 RAW BACKEND DATA:", notificationRes.data.data);
        //  MEMBERS FIX
        const formattedMembers = memberRes.data.members.map((m: any) => ({
          id: m._id,
          name: m.name,
        }));
        setMembers(formattedMembers);
        const formattedNotifications =
          notificationRes.data.data.map(formatNotification);

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [auth?.slug, auth?.user?.userId]);

  const handleAddOrUpdateNotification = (rawNotification: any) => {
    const formatted = formatNotification(rawNotification);
    setNotifications((prev) => {
      const exists = prev.find((n) => n.id === formatted.id);
      if (exists) {
        return prev.map((n) => (n.id === formatted.id ? formatted : n));
      } else {
        return [formatted, ...prev];
      }
    });
  };
  //edit notification
  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setOpen(true); // same modal reuse
  };

  //delete notification
  const handleDelete = async (id: string) => {
    console.log("Attempting to delete notification with ID:", id);
    try {
      if (!Swal) return;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      await deleteNotification(auth?.slug || "", id);

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="p-4 sm:p-6 text-base-content ">
      <div className="max-w-6xl mx-auto space-y-6  ">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">Notifications</h1>

          {["admin", "owner"].includes(currentUserRole) && (
            <Button
              className="flex items-center justify-center gap-2 px-4 py-2.5
              rounded-xl bg-primary text-primary-content
              text-sm font-medium hover:bg-primary/90
              transition shadow-sm w-full sm:w-auto"
              onClick={() => setOpen(true)}
            >
              <MdSend size={18} />
              Send Notification
            </Button>
          )}
        </div>

        {/* Notification Content */}
        {notifications.length === 0 ? (
          <div className="border border-base-300 rounded-2xl p-10 text-center bg-base-100 shadow-sm">
            <div className="flex justify-center mb-4">
              <MdNotificationsNone size={42} className="text-base-content/40" />
            </div>

            <h2 className="text-lg font-medium mb-1">No Notifications Yet</h2>

            <p className="text-sm text-base-content/60">
              Notifications you receive will appear here.
            </p>
          </div>
        ) : (
          <NotificationPage
            notifications={notifications}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Modal */}
        {["admin", "owner"].includes(currentUserRole) && (
          <SendNotificationModal
            open={open}
            onClose={() => {
              setOpen(false);
              setEditingNotification(null);
            }}
            onSend={handleAddOrUpdateNotification}
            members={members}
            currentAdminId={currentUserId}
            editingNotification={editingNotification}
          />
        )}
      </div>
    </div>
  );
}
