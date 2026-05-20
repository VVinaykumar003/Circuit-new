// import { useState } from "react";
// import { MdClose } from "react-icons/md";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
// import Select from "@/components/ui/Select";
// import type { Notification } from "@/type/notification";
// import { useAuth } from "@/auth/AuthContext";
// import { sendNotification } from "@/services/notificationService";
// import { toast } from "react-toastify";

// interface Member {
//   id: string;
//   name: string;
// }

// interface Props {
//   open: boolean;
//   onClose: () => void;
//  onSend: (notification: Notification) => void;
//   members: Member[];
//   currentAdminId: string;
//   editingNotification?: Notification | null;
// }

// export default function SendNotificationModal({
//   open,
//   onClose,
//   onSend,
//   members,
//   currentAdminId,
// }: Props) {
//   const [file, setFile] = useState<File | null>(null);
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [priority, setPriority] = useState<"low" | "normal" | "urgent">(
//     "normal",
//   );
//   const [isSending, setIsSending] = useState(false);
//   const [target, setTarget] = useState("all");
//   const {auth} = useAuth();
//   if (!open) return null;

// const handleSend = async () => {
//   try {
//    setIsSending(true);
//     const user=auth?.user;
//     if (!user) {
//       alert("User not found");
//       return;
//     }

//   const organizationSlug = auth?.slug || "";

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("message", message);
//     formData.append("priority", priority);

//     if (target === "all") {
//       formData.append("sendTo", "all");
//     } else {
//       formData.append("sendTo", "specific");
//       formData.append("recipients", target);
//     }

//     if (file) {
//       formData.append("attachments", file);
//     }

//     const res = await sendNotification(organizationSlug, formData);

//     console.log(" Response:", res.data);

//   if (res?.data?.success) {
//   onSend(res.data.data);
//   toast.success("Notification sent successfully!");
// }

//     // reset
//     setTitle("");
//     setMessage("");
//     setPriority("normal");
//     setTarget("all");
//     setFile(null);

//     onClose();

//   } catch (error: any) {
//     console.error("Error:", error);
//     toast.error(error?.response?.data?.message || "Failed to send notification");
//   }
//   finally {
//     setIsSending(false);
//   }
// };
//   return (
//     <div className="fixed inset-0 bg-base-content/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//       <div className="bg-base-100 border-base-300 text-base-content w-full max-w-lg rounded-xl p-8 shadow-2xl border space-y-6 animate-in fade-in zoom-in-95 duration-200">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-semibold text-base-content">
//               New Notification
//             </h3>
//             <p className="text-sm text-base-content/60 mt-1">
//               Send a message to employees
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-base-200 transition"
//           >
//             <MdClose size={20} className="text-base-content/60" />
//           </button>
//         </div>

//         {/* Title */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium text-base-content">Title</label>
//           <Input
//             placeholder="Enter notification title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//         </div>

//         {/* Message */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium text-base-content">Message</label>
//          <textarea
//   className="w-full rounded-xl border border-base-300 bg-base-100 p-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
//             rows={4}
//             placeholder="Write your message here..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
//         </div>
//         {/* Attachment */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium text-gray-700">
//             Attachment (optional)
//           </label>

//           {!file ? (
//             <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed  rounded-xl cursor-pointertransition border-base-300 hover:border-primary text-base-content/60 text-sm ">
//               Click to upload file
//               <input
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => {
//                   if (e.target.files && e.target.files[0]) {
//                     setFile(e.target.files[0]);
//                   }
//                 }}
//               />
//             </label>
//           ) : (
//             <div className="flex items-center justify-between bg-base-200 border-base-300  border rounded-xl px-4 py-2 text-sm">
//               <div className="flex flex-col">
//                 <span className="font-medium text-base-content">{file.name}</span>
//                 <span className="text-xs text-base-content/60">
//                   {(file.size / 1024).toFixed(1)} KB
//                 </span>
//               </div>

//               <button
//                 onClick={() => setFile(null)}
//                 className="text-base-content/60 hover:text-error transition"
//               >
//                 ✕
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Priority + Target */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">
//               Priority
//             </label>
//             <Select
//               value={priority}
//               onChange={(e) => setPriority(e.target.value as any)}
//             >
//               <option value="low">Low</option>
//               <option value="normal">Normal</option>
//               <option value="urgent">Urgent</option>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700">Send To</label>
//             <Select value={target} onChange={(e) => setTarget(e.target.value)}>
//               <option value="all">All Employees</option>
//               {members.map((m) => (
//                 <option key={m.id} value={m.id}>
//                   {m.name}
//                 </option>
//               ))}
//             </Select>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//           <Button variant="ghost" onClick={onClose}>
//             Cancel
//           </Button>

//         <button
//   disabled={isSending || !title.trim() || !message.trim()}
//   onClick={handleSend}
//   className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
// >
//   {isSending ? "Sending..." : "Send Notification"}
// </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Notification } from "@/type/notification";
import { useAuth } from "@/auth/AuthContext";
import { sendNotification, updateNotification } from "@/services/notificationService";
import { toast } from "react-toastify";

interface Member {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (notification: Notification) => void;
  members: Member[];
  currentAdminId: string;
  editingNotification?: Notification | null;
}

export default function SendNotificationModal({
  open,
  onClose,
  onSend,
  members,
  currentAdminId,
  editingNotification = null,
}: Props) {
  const { auth } = useAuth();

  // Top-level hooks
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "urgent">(
    "normal",
  );
  const [target, setTarget] = useState("all");
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Prefill for edit
  useEffect(() => {
    if (editingNotification) {
      setTitle(editingNotification.title);
      setMessage(editingNotification.message);
      setPriority(editingNotification.priority);
      setTarget(
        editingNotification.sendTo === "all"
          ? "all"
          : editingNotification.targetUserIds[0] || "all",
      );
      setExistingAttachments(editingNotification.attachments || []);
      console.log("editingNotification",editingNotification)
      setFile(null); // reset file for new upload if needed
    } else {
      // reset modal if not editing
      setTitle("");
      setMessage("");
      setPriority("normal");
      setTarget("all");
      setFile(null);
      setExistingAttachments([]);
    }
  }, [editingNotification]);

  if (!open) return null;

  const handleSend = async () => {
    try {
      setIsSending(true);
      const user = auth?.user;
      if (!user) {
        alert("User not found");
        return;
      }

      const organizationSlug = auth?.slug || "";

      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);
      formData.append("priority", priority);

      if (target === "all") {
        formData.append("sendTo", "all");
      } else {
        formData.append("sendTo", "specific");
        formData.append("recipients", target);
      }

      if (file) {
        formData.append("attachments", file);
      }

      const res = editingNotification 
        ? await updateNotification(organizationSlug, editingNotification._id, formData)
        : await sendNotification(organizationSlug, formData);

      if (res?.data?.success) {
        onSend(res.data.data);
        toast.success(
          editingNotification ? "Notification updated successfully!" : "Notification sent successfully!"
        );
        setTitle("");
        setMessage("");
        setPriority("normal");
        setTarget("all");
        setFile(null);
        setExistingAttachments([]);
        onClose();
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to send notification",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-base-content/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-base-100 border-base-300 text-base-content w-full max-w-lg rounded-xl p-8 shadow-2xl border space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-base-content">
              {editingNotification ? "Edit Notification" : "New Notification"}
            </h3>
            <p className="text-sm text-base-content/60 mt-1">
              {editingNotification
                ? "Update your message"
                : "Send a message to employees"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-base-200 transition"
          >
            <MdClose size={20} className="text-base-content/60" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">Title</label>
          <Input
            placeholder="Enter notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Message
          </label>
          <textarea
            className="w-full rounded-xl border border-base-300 bg-base-100 p-3 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            rows={4}
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Attachment (optional)
          </label>

          {file ? (
            <div className="flex items-center justify-between bg-base-200 border-base-300 border rounded-xl px-4 py-2 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-base-content">
                  {file.name}
                </span>
                <span className="text-xs text-base-content/60">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-base-content/60 hover:text-error transition"
              >
                ✕
              </button>
            </div>
          ) : existingAttachments.length > 0 ? (
            <div className="flex items-center justify-between bg-base-200 border-base-300 border rounded-xl px-4 py-2 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-base-content">
                  {existingAttachments[0].fileName || "Attachment"}
                </span>
              </div>
              <button
                onClick={() => setExistingAttachments([])}
                className="text-base-content/60 hover:text-error transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer border-base-300 hover:border-primary text-base-content/60 text-sm">
              Click to upload file
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0])
                    setFile(e.target.files[0]);
                }}
              />
            </label>
          )}
        </div>

        {/* Priority + Target */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content">
              Priority
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content">Send To</label>
            <Select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All Employees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <button
            disabled={isSending || !title.trim() || !message.trim()}
            onClick={handleSend}
            className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending
              ? "Sending..."
              : editingNotification
                ? "Update Notification"
                : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}
