
import { useEffect, useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import {
  MdViewList,
  MdDashboard,
  MdAssignment,
  MdHourglassEmpty,
  MdAutorenew,
  MdCheckCircle,
  MdErrorOutline,
  MdAdd,
} from "react-icons/md";

import { PageHeader, StatsGrid } from "@/components/common";
import TaskTable from "@/components/task/TaskTable";
import TaskKanban from "@/components/task/TaskKanbanComponent";
import EmptyState from "@/components/ui/EmptyState";
import TaskDrawer from "@/components/task/TaskDrawer";
import TaskFilters from "@/components/task/TaskFilter";
import type { Task } from "@/type/task";
import MobileTabs from "@/components/task/MobileTabs";
import { useAuth } from "@/auth/useAuth";
import { toast } from "react-toastify";
import API from "@/api/axios";
import NewTaskModal from "@/components/projects/NewTaskModal";
import Pagination from "@/components/ui/Pagination";

/* ---------------- TYPES ---------------- */

type TaskView = "table" | "kanban";
type TaskFilter = "all" | "this-week" | "high-priority" | "overdue";

/* ---------------- CONSTANTS ---------------- */

const ITEMS_PER_PAGE = 7;

/* ---------------- COMPONENT ---------------- */

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const { auth } = useAuth();
  const userRole = auth?.user?.role?.toLowerCase() || "";
  const canCreateTask = ["admin", "owner", "manager"].includes(userRole);

  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<TaskView>("table");

  /* ---------------- FETCH TASKS ---------------- */

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/tasks/${auth.slug}/getTasks`);
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [auth?.slug]);

  const handleDeleteTask = async (task: Task) => {
    try {
      const res = await API.delete(
        `/tasks/${auth.slug}/deleteTask/${task.projectId}/${task._id}`,
      );

      if (res.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== task._id));

        toast.success("Task deleted");
        setSelectedTask(null);
      }
    } catch (error) {
      console.error("Delete task error:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task,
      ),
    );
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, projectId?: string) => {
    try {
      const task = tasks.find((t) => String(t._id || (t as any).id) === String(taskId));
      const rawProjId = projectId || task?.projectId;
      const projId = typeof rawProjId === "object" && (rawProjId as any)?._id
        ? (rawProjId as any)._id
        : rawProjId;

      const endpoint = projId && projId !== "undefined"
        ? `/tasks/${auth.slug}/updateTaskStatus/${projId}/${taskId}`
        : `/tasks/${auth.slug}/updateTaskStatus/${taskId}`;

      const res = await API.patch(endpoint, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Task status updated to ${newStatus.replace("-", " ")}`);
        if (res.data.data) {
          handleTaskUpdated(res.data.data);
        }
      }
    } catch (error: any) {
      console.error("Failed to update task status in backend:", error);
      toast.error(error.response?.data?.message || "Failed to update task status");
      fetchTasks();
    }
  };
  /* ---------------- FILTER LOGIC ---------------- */

  const filteredTasks = useMemo(() => {
    const today = new Date();

    return tasks.filter((task) => {
      const due = new Date(task.dueDate);

      switch (activeFilter) {
        case "this-week":
          const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7;

        case "high-priority":
          return task.priority === "high";

        case "overdue":
          return due < today && task.status !== "completed";

        default:
          return true;
      }
    });
  }, [tasks, activeFilter]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE) || 1;

  // Prevent being stuck on an empty page if items are deleted or filtered
  const validPage = Math.min(page, totalPages);

  const paginatedTasks = filteredTasks.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE,
  );

  /* ---------------- RESET PAGE ---------------- */

  useEffect(() => {
    setPage(1);
  }, [activeFilter, active]);

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return <div className="p-6">Loading tasks...</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        title="Tasks"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Tasks", active: true },
        ]}
        actions={
          canCreateTask
            ? [
                {
                  label: "New Task",
                  icon: <MdAdd size={16} />,
                  variant: "primary",
                  onClick: () => setOpen(true),
                },
              ]
            : []
        }
      />

      {/* ================= STATS ================= */}
      <StatsGrid
        columns={{ default: 2, sm: 3, md: 3, lg: 5 }}
        stats={[
          {
            label: "Total Tasks",
            value: tasks.length,
            icon: <MdAssignment size={18} />,
            color: "text-base-content",
          },
          {
            label: "Pending",
            value: tasks.filter((t) => t.status === "pending").length,
            icon: <MdHourglassEmpty size={18} />,
            color: "text-warning",
          },
          {
            label: "In Progress",
            value: tasks.filter((t) => t.status === "in-progress").length,
            icon: <MdAutorenew size={18} />,
            color: "text-info",
          },
          {
            label: "Completed",
            value: tasks.filter((t) => t.status === "completed").length,
            icon: <MdCheckCircle size={18} />,
            color: "text-success",
          },
          {
            label: "Overdue",
            value: tasks.filter((t: any) => {
              const due = new Date(t.dueDate);
              return due < new Date() && t.status !== "completed";
            }).length,
            icon: <MdErrorOutline size={18} />,
            color: "text-error",
          },
        ]}
      />

      {/* ================= FILTER + VIEW ================= */}
{/* 
      <section className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <TaskFilters value={activeFilter} onChange={setActiveFilter} />

        <div className="md:flex flex-wrap gap-2 w-full lg:w-auto ">
          <Button
           size="sm"
            variant="primary"
            onClick={() => setOpen(true)}
            className="flex-1 sm:flex-none"
          >
            + New Task
          </Button>

          <Button
            size="sm"
            variant={active === "table" ? "primary" : "outline"}
             className={`${active === "table" ? "text-white" : "text-base-content border-base-content"}`}
            onClick={() => setActive("table")}
          >
            <MdViewList size={18} className="mr-1" />
            Table
          </Button>

          <Button
            size="sm"
            variant={active === "kanban" ? "primary" : "outline"}
            className={`${active === "kanban" ? "text-white" : "text-base-content border-base-content"}`}
            onClick={() => setActive("kanban")}
          >
            <MdDashboard size={18} className="mr-1" />
            Kanban
          </Button>
        </div>
      </section> */}

      {/* ================= FILTER + VIEW ================= */}

<section className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
  <TaskFilters value={activeFilter} onChange={setActiveFilter} />

  <div className="flex flex-wrap gap-2 w-full lg:w-auto">
    
    {/* NEW TASK → ONLY VISIBLE TO ADMIN / OWNER / MANAGER */}
    {canCreateTask && (
      <Button
        size="sm"
        variant="primary"
        onClick={() => setOpen(true)}
        className="flex-1 sm:flex-none"
      >
        + New Task
      </Button>
    )}

    {/* THESE → ONLY DESKTOP */}
    <div className="hidden md:flex gap-2">
      <Button
        size="sm"
        variant={active === "table" ? "primary" : "outline"}
        className={`${active === "table" ? "text-white" : "text-base-content border-base-content"}`}
        onClick={() => setActive("table")}
      >
        <MdViewList size={15} className="mr-1" />
        Table
      </Button>

      <Button
        size="sm"
        variant={active === "kanban" ? "primary" : "outline"}
        className={`${active === "kanban" ? "text-white" : "text-base-content border-base-content"}`}
        onClick={() => setActive("kanban")}
      >
        <MdDashboard size={15} className="mr-1" />
        Kanban
      </Button>
    </div>

  </div>
</section>

      {/* ================= CONTENT ================= */}

      <section className="bg-base-100 border border-base-300 rounded-xl p-2 sm:p-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <EmptyState
              title="No tasks found"
              description={
                activeFilter === "all"
                  ? "You don't have any tasks yet. Create one to get started!"
                  : `You have no ${activeFilter.replace("-", " ")} tasks.`
              }
            />
            {canCreateTask && (
              <Button variant="primary" className="mt-6" onClick={() => setOpen(true)}>
                + Get Started
              </Button>
            )}
          </div>
        ) : active === "table" ? (
          <>
            <TaskTable
              tasks={paginatedTasks}
              onOpenTask={(task) => {
                setSelectedTask(task);
                setDrawerMode("view");
              }}
              onEditTask={(task) => {
                setSelectedTask(task);
                setDrawerMode("edit");
              }}
              onDeleteTask={handleDeleteTask}
            />

            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : active === "kanban" ? (
          <div className="overflow-x-auto">
            <TaskKanban
              tasks={filteredTasks}
              setTasks={setTasks}
              onTaskSelect={setSelectedTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : null}
      </section>

      {/* ================= DRAWER ================= */}

      <TaskDrawer
        task={selectedTask}
        mode={drawerMode}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdated}
      />

      <MobileTabs active={active} onChange={setActive} />

      {open && (
        <NewTaskModal
          onClose={() => setOpen(false)}
          onCreate={async () => {
            await fetchTasks();
            setOpen(false);
            
          }}
        />
      )}
    </div>
  );
}
