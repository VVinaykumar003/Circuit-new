import { useEffect, useState } from "react";

import TaskStatusSelect from "./TaskStatusSelect";
import Pagination from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import NewTaskModal from "./NewTaskModal";
import Swal from "sweetalert2";
import {
  Calendar,
  AlignLeft,
  Flag,
  CheckSquare,
  Paperclip,
  Plus,
  X,
} from "lucide-react";
import API from "@/api/axios";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import { Edit2, FileEdit, Trash } from "lucide-react";

/* ================= TYPES ================= */

type TaskStatus = "pending" | "in-progress" | "completed";
type Subtask = {
  _id?: string;
  title: string;
  completed: boolean;
};
type Task = {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  description?: string;
  createdAt?: string;
  priority?: string;
  tags: string[];
  attachments: string[];
  subtasks?: Subtask[];
  isEditing?: boolean;
};

type Role = "admin" | "manager" | "employee" | "owner";

interface Props {
  projectId: string;
  projectRole: string;

}

/* ================= TASK DRAWER ================= */
function TaskDrawer({
  projectId,
  task,
  onClose,
  onToggleSubtask,
  canEditTask,
}: {
  projectId: string;
  task: Task;
  onClose: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  canEditTask: boolean;
}) {
  const { auth } = useAuth();
  const [isEditing] = useState(task.isEditing || false);
  const [editedTask, setEditedTask] = useState(task);
  const [newSubtask, setNewSubtask] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    setEditedTask((prev) => ({
      ...prev,
      subtasks: [
        ...(prev.subtasks || []),
        {
          title: newSubtask,
          completed: false,
        },
      ],
    }));

    setNewSubtask("");
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("title", editedTask.title);
      formData.append("description", editedTask.description || "");
      formData.append("priority", editedTask.priority || "medium");
      formData.append("status", editedTask.status);
      formData.append("dueDate", editedTask.dueDate);
      formData.append("subtasks", JSON.stringify(editedTask.subtasks || []));

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      await API.put(
        `/tasks/${auth.slug}/updateTask/${projectId}/${task.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Task Updated Successfully");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error updating task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full max-w-lg bg-base-100 h-full shadow-xl p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* TITLE */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1 text-base-content/70">
            <AlignLeft size={16} />
            <span className="text-sm">Title</span>
          </div>

          {isEditing ? (
            <input
              className="input input-bordered w-full"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
            />
          ) : (
            <p className="font-semibold text-lg">{task.title || "No title"}</p>
          )}
        </div>

        {/* DUE DATE */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1 text-base-content/70">
            <Calendar size={16} />
            <span className="text-sm">Due Date</span>
          </div>

          {isEditing ? (
            <input
              type="date"
              className="input input-bordered w-full"
              value={editedTask.dueDate?.split("T")[0]}
              onChange={(e) =>
                setEditedTask({ ...editedTask, dueDate: e.target.value })
              }
            />
          ) : (
            <p>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("en-GB")
                : "No due date"}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1 text-base-content/70">
            <AlignLeft size={16} />
            <span className="text-sm">Description</span>
          </div>

          {isEditing ? (
            <textarea
              className="textarea textarea-bordered w-full"
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  description: e.target.value,
                })
              }
            />
          ) : (
            <p>{task.description || "No description added"}</p>
          )}
        </div>

        {/* PRIORITY */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1 text-base-content/70">
            <Flag size={16} />
            <span className="text-sm">Priority</span>
          </div>

          {isEditing ? (
            <select
              className="select select-bordered w-full"
              value={editedTask.priority}
              onChange={(e) =>
                setEditedTask({ ...editedTask, priority: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <p className="capitalize">
              {task.priority || "No priority set"}
            </p>
          )}
        </div>

        {/* SUBTASKS */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={16} />
            <h3 className="font-semibold">Subtasks</h3>
          </div>

          {editedTask.subtasks?.length === 0 && (
            <p className="text-sm text-base-content/60">
              No subtasks added
            </p>
          )}

          {editedTask.subtasks?.map((sub, index) => (
            <div key={sub._id || index} className="flex gap-2 mb-2 items-center">
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => {
                  onToggleSubtask(task.id, sub._id, sub.completed);

                  const updated = [...(editedTask.subtasks || [])];
                  updated[index].completed = !sub.completed;

                  setEditedTask({
                    ...editedTask,
                    subtasks: updated,
                  });
                }}
              />

              {isEditing ? (
                <input
                  className="input input-bordered input-sm w-full"
                  value={sub.title}
                  onChange={(e) => {
                    const updated = [...(editedTask.subtasks || [])];
                    updated[index].title = e.target.value;
                    setEditedTask({ ...editedTask, subtasks: updated });
                  }}
                />
              ) : (
                <span
                  className={
                    sub.completed
                      ? "line-through text-base-content/50"
                      : ""
                  }
                >
                  {sub.title}
                </span>
              )}
            </div>
          ))}

          {isEditing && (
            <div className="flex gap-2 mt-2">
              <input
                className="input input-bordered input-sm w-full"
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <button
                className="btn btn-sm btn-primary flex gap-1 items-center"
                onClick={handleAddSubtask}
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          )}
        </div>

        {/* ATTACHMENTS */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Paperclip size={16} />
            <h3 className="font-semibold">Attachments</h3>
          </div>

          {!isEditing && task.attachments?.length === 0 && (
            <p className="text-sm text-base-content/60">
              No attachments uploaded
            </p>
          )}

          {!isEditing &&
            task.attachments?.map((file, i) => (
              <a
                key={i}
                href={file}
                target="_blank"
                className="link link-primary block"
              >
                View Attachment
              </a>
            ))}

          {isEditing && (
            <>
              <input
                type="file"
                multiple
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
              />

              {files.length === 0 && (
                <p className="text-sm text-base-content/60 mt-2">
                  No files selected
                </p>
              )}

              {files.map((file, i) => (
                <p key={i} className="text-sm mt-1">
                  {file.name}
                </p>
              ))}
            </>
          )}
        </div>

        {/* SAVE BUTTON */}
        {isEditing && (
          <button
            className="btn btn-primary w-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}



/* ================= MAIN COMPONENT ================= */

export default function ProjectTasks({ projectId ,projectRole }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);

  const { auth } = useAuth();

const canEditTask =
  ["admin", "owner"].includes(auth.user?.role) ||
  ["Manager"].includes(projectRole);

const canDelete =
  ["admin", "owner"].includes(auth.user?.role) ||

  ["Manager"].includes(projectRole);
  /* ================= FETCH TASKS ================= */

  const toggleSubtask = async (
    taskId: string,
    subtaskId: string,
    completed: boolean,
  ) => {
    try {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.map((sub) =>
                  sub._id === subtaskId
                    ? { ...sub, completed: !completed }
                    : sub,
                ),
              }
            : task,
        ),
      );

      setSelectedTask((prev) => {
        if (!prev || prev.id !== taskId) return prev;

        return {
          ...prev,
          subtasks: prev.subtasks?.map((sub) =>
            sub._id === subtaskId ? { ...sub, completed: !completed } : sub,
          ),
        };
      });

      await API.patch(
        `/tasks/${auth.slug}/updateSubtaskStatus/${projectId}/${taskId}/${subtaskId}`,
      );
    } catch (error) {
      console.error("Subtask update failed", error);
    }
  };
    const fetchTasks = async () => {
      try {
        const res = await API.get(`/tasks/${auth.slug}/getTasks/${projectId}`);
        // console.log("Fetched tasks:", res.data.data); // Debug log

        const formattedTasks = res.data.data.map((t: any) => ({
          id: t._id,
          title: t.title,
          assignee: t.assignedTo?.[0]?.name || "Unassigned",
          status: t.status.toLowerCase(),
          dueDate: t.dueDate,
          description: t.description,
          createdAt: new Date(t.createdAt).toLocaleDateString("en-GB"),
          priority: t.priority,
          tags: t.tag || [],
          attachments: t.attachments || [],
          subtasks: t.subtasks || [],
        }));-

        setTasks(formattedTasks);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

   useEffect(() => {
  if (auth.slug && projectId) {
    fetchTasks();
  }
}, [auth.slug, projectId]);
  

  /* ---------- Optimistic Status Update ---------- */

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = tasks;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await API.patch(
        `/tasks/${auth.slug}/updateTaskStatus/${projectId}/${taskId}`,
        { status: newStatus },
      );
      toast.success("Task status updated");
    } catch (err) {
      console.error("Status update failed", err);
      setTasks(previousTasks);
    }
  };

  /* ---------- Delete ---------- */
  const deleteTask = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await API.delete(
        `/tasks/${auth.slug}/deleteTask/${projectId}/${id}`,
      );

      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success("Task deleted");
        setSelectedTask(null);
      }
    } catch (error) {
      console.error("Delete task error:", error);
    }
  };

  /* ---------- Pagination ---------- */

  const { page, setPage, totalPages, paginatedData } = usePagination(tasks, 5);

  return (
    <>
      {/* TASK LIST */}
      <div className="rounded-lg overflow-hidden">
        <div className="p-4  border-base-300 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ">
          <h3 className="font-semibold text-base-content">Tasks</h3>

          {canEditTask && (
            <button
              className="btn btn-sm btn-primary w-full sm:w-auto"
              onClick={() => setShowNewTask(true)}
            >
              + New Task
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="py-16 text-center text-base-content/60">
            No Tasks Found
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="table min-w-[600px] border border-base-300 rounded-lg">
              <thead className="bg-primary text-primary-content ">
                <tr className="divide-x divide-white/20">
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th className="">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((task) => (
                  <tr
                    key={task.id}
                    className="text-base-content hover:bg-base-300 cursor-pointer divide-x divide-primary/10"
                    onClick={() =>
                      setSelectedTask({ ...task, isEditing: false })
                    }
                  >
                    <td>{task.title}</td>
                    <td>{task.assignee}</td>

                    <td onClick={(e) => e.stopPropagation()}>
                     
                        <TaskStatusSelect
                        
                          value={task.status}
                          onChange={(s) => updateTaskStatus(task.id, s)}
                          disabled={auth.user?.role === "employee"}
                        />
                     
                    </td>

                    <td>
                      {new Date(task.dueDate).toLocaleDateString("en-GB")}
                    </td>

                    <td
                      className=""
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEditTask && (
                        <button
                          className="btn btn-xs m-1.5"
                          title="Edit Task"
                          onClick={() =>
                            setSelectedTask({
                              ...task,
                              isEditing: true,
                            })
                          }
                        >
                          <FileEdit size={16} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          className="btn btn-xs btn-error"
                          title="Delete Task"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center sm:justify-end p-4 border-t border-base-300">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* NEW TASK */}
      {showNewTask && (
        <NewTaskModal
          projectId={projectId}
          onClose={() => setShowNewTask(false)}
          onCreate={async () => {
  await fetchTasks();
  setShowNewTask(false);
}
          }
        />
      )}

      {/* DRAWER */}
      {selectedTask && (
        <TaskDrawer
          projectId={projectId}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleSubtask={toggleSubtask}
          canEditTask={canEditTask}
        />
      )}
    </>
  );
}
