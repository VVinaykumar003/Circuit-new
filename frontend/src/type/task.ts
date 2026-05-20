export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export type ChecklistItem = {
  _id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  projectId: any;
  _id: string;
  title: string;
  description?: string;
  assignedTo?: { _id: string; name: string }[];
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  tag?: string[];
  attachments?: File[];
  subtasks?: ChecklistItem[];
};