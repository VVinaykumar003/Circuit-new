import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import Button from "../ui/Button";
import type { Task, TaskPriority, TaskStatus } from "../../type/task";

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export default function EditTaskModal({
  open,
  task,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  /* ---------- Populate data ---------- */
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setAssignee(task.assignee);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSave = () => {
    onSave({
      ...task,
      title,
      description,
      assignee,
      status,
      priority,
      dueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-base-100 rounded-xl shadow-xl border border-base-300">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <h3 className="text-lg font-semibold text-base-content">
            Edit Task 
          </h3>

          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">

          {/* TITLE */}
          <div>
            <label className="text-xs text-base-content/60">
              Task title
            </label>
            <input
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-base-content/60">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 gap-4">

            {/* ASSIGNEE */}
            <div>
              <label className="text-xs text-base-content/60">
                Assignee
              </label>
              <input
                className="input input-bordered w-full"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>

            {/* DUE DATE */}
            <div>
              <label className="text-xs text-base-content/60">
                Due date
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="text-xs text-base-content/60">
                Status
              </label>
              <select
                className="select select-bordered w-full"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as TaskStatus)
                }
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div>
              <label className="text-xs text-base-content/60">
                Priority
              </label>
              <select
                className="select select-bordered w-full"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskPriority)
                }
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-base-300">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!title || !assignee}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
