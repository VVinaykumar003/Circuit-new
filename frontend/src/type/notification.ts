// export type NotificationPriority =
//   | "low"
//   | "normal"
//   | "urgent";

// export type Notification = {
//   id: string;
//   title: string;
//   message: string;
//   attachments?: string;
//   type: "success" | "error" | "warning" | "info";
//   read: boolean;
//   priority: NotificationPriority;
//   targetUserIds: string[]; // [] = broadcast
//   createdBy: string;
//   createdAt: string;
//   readBy: string[]; // user IDs
// };
export type Attachment = {
  fileUrl: string;
  fileName: string;
  fileType: string;
};

export type NotificationPriority =
  | "low"
  | "normal"
  | "urgent";

export type Notification = {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;

  targetUserIds: string[]; // [] = broadcast
  createdBy: string;
  createdAt: string;

  readBy: string[];

  attachments: Attachment[]; 
  sendTo: "all" | "specific"; 
};