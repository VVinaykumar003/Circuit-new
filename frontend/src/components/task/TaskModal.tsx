import { MdClose, MdPerson, MdFlag, MdCalendarToday } from "react-icons/md";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TagsInput from "@/components/ui/TagsInput";
import type { Task } from "@/type/task";
import { useEffect, useState } from "react";
import AttachmentInput from "../ui/AttachmentInput";
import Checklist from "../ui/CheckList";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export default function TaskModal({ open, onClose, onSave }: Props) {
  if (!open) return null;

  const [task, setTask] = useState<Task>({
    id: crypto.randomUUID(),
    title: "",
    description: "",
    assignee: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    createdAt: new Date().toISOString(),
    tags: [],
    attachments: [],
    checklist: [],
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // backdrop close
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // prevent backdrop close
            className="
    w-full max-w-xl
    max-h-[90vh]
    bg-base-100
    rounded-xl
    shadow-2xl
    border border-base-300
    flex flex-col
  "
          >
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
              <span className="badge badge-outline">New Task</span>

              <button onClick={onClose} className="btn btn-sm btn-ghost">
                <MdClose size={18} />
              </button>
            </div>

            {/* ================= BODY ================= */}
            <div className="p-6 space-y-6">
              {/* TITLE */}
              <Input
                autoFocus
                placeholder="Task title"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                className="text-xl font-semibold border-0 px-0 focus:ring-0"
              />

              {/* META ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* ASSIGNEE */}
                <div className="bg-base-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-base-content/60 mb-1">
                    <MdPerson size={14} />
                    Assignee
                  </div>

                  <Input
                    placeholder="Assign to"
                    value={task.assignee}
                    onChange={(e) =>
                      setTask({ ...task, assignee: e.target.value })
                    }
                    className="border-0 bg-transparent px-0 text-sm"
                  />
                </div>

                {/* DUE DATE */}
                <div className="bg-base-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-base-content/60 mb-1">
                    <MdCalendarToday size={14} />
                    Due date
                  </div>

                  <input
                    type="date"
                    value={task.dueDate}
                    onChange={(e) =>
                      setTask({ ...task, dueDate: e.target.value })
                    }
                    className="
        w-full bg-transparent
        text-sm outline-none
        cursor-pointer
      "
                  />
                </div>

                {/* PRIORITY */}
                <div className="bg-base-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-base-content/60 mb-1">
                    <MdFlag size={14} />
                    Priority
                  </div>

                  <Select
                    value={task.priority}
                    onChange={(e) =>
                      setTask({
                        ...task,
                        priority: e.target.value as any,
                      })
                    }
                    className="border-0 bg-transparent text-sm"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </Select>
                </div>
              </div>

              {/* TAGS */}
              <TagsInput
                value={task.tags || []}
                onChange={(tags) => setTask({ ...task, tags })}
              />

              {/* DESCRIPTION */}
              <textarea
                placeholder="Add description..."
                value={task.description}
                onChange={(e) =>
                  setTask({
                    ...task,
                    description: e.target.value,
                  })
                }
                className="textarea textarea-bordered w-full resize-none border border-base-300 focus:ring-0"
                rows={4}
              />
            </div>

            {/* ATTACHMENTS + CHECKLIST */}
            <div className="px-6 space-y-6 mb-2">
              <AttachmentInput
                files={task.attachments || []}
                onChange={(files) => setTask({ ...task, attachments: files })}
              />

              <Checklist
                value={task.checklist || []}
                onChange={(items) => setTask({ ...task, checklist: items })}
              />
            </div>

            {/* ================= FOOTER ================= */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-base-300">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>

              <Button
                variant="primary"
                disabled={!task.title}
                onClick={() => {
                  onSave(task);
                  onClose();
                }}
              >
                Create Task
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
