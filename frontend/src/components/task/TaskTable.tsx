import type { Task } from "@/type/task";
import StatusBadge from "../ui/StatusBadge";
import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { FileEdit, Trash2Icon } from "lucide-react";
import Swal from "sweetalert2";

interface Props {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}
function TaskTable({ tasks, onOpenTask, onEditTask, onDeleteTask }: Props) {
  const { auth } = useAuth();
  const role = auth?.user?.role;
  const canEdit = ["admin", "manager", "owner"].includes(role || "");

  if (tasks.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-lg p-6 text-center text-sm text-base-content/60">
        No tasks found
      </div>
    );
  }

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg overflow-x-scroll">
      <table className="table table-zebra w-full min-w-150 ">
        <thead className=" bg-primary text-md text-primary-content border-primary/60">
          <tr className="divide-x divide-white/20">
            <th className="whitespace-nowrap">Task</th>
            <th className="whitespace-nowrap">Assignee</th>
            <th className="whitespace-nowrap">Status</th>
            <th className="whitespace-nowrap">Due</th>
            {canEdit && (
              <th className="whitespace-nowrap text-center">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="divide-x divide-purple-50 cursor-pointer hover:bg-base-200 text-base-content text-sm"
              onClick={() => onOpenTask(task)}
            >
              <td className="font-medium ">{task.title}</td>
              <td>{task.assignedTo?.[0]?.name || "Unassigned"}</td>
              <td>
                <StatusBadge
                  status={
                    task.status === "completed"
                      ? "approved"
                      : task.status === "in-progress"
                        ? "pending"
                        : "pending"
                  }
                />
              </td>
              <td> {new Date(task.dueDate).toLocaleDateString("en-GB")}</td>

              {canEdit && (
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="lg:tooltip" data-tip="Edit">

                    <button
                      className="btn btn-sm btn-ghost hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                    >
                      <FileEdit size={16} />
                    </button>
                    </div>



                    <div className="lg:tooltip" data-tip="Delete">
                    <button
                      className="btn btn-sm btn-ghost hover:bg-error/10 text-error"
                      onClick={(e) => {
                        e.stopPropagation();

                        Swal.fire({
                          title: "Delete Task?",
                          text: `Are you sure you want to delete "${task.title}"?`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#ef4444",
                          cancelButtonColor: "#6b7280",
                          confirmButtonText: "Yes, delete it",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            onDeleteTask(task);
                          }
                        });
                      }}
                    >
                      <Trash2Icon size={16} />
                    </button>
                      </div>    




                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(TaskTable);
