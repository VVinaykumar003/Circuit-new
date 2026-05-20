// import type { Task } from "@/type/task";
// import { useEffect, useMemo, useState } from "react";
// import TaskStatusSelect from "../projects/TaskStatusSelect";

// interface MemberTaskProps {
//   memberId: string;
// }

// type TaskStatus = "pending" | "in-progress" | "completed";

// const STATUS_TABS: { label: string; value: TaskStatus }[] = [
//   { label: "Pending", value: "pending" },
//   { label: "In Progress", value: "in-progress" },
//   { label: "Completed", value: "completed" },
// ];

// const MemberTask = ({ memberId }: MemberTaskProps) => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

//   const [activeStatus, setActiveStatus] =
//     useState<TaskStatus>("pending");

//   /* ADD TASK STATE */
//   const [showForm, setShowForm] = useState(false);
//   const [newTask, setNewTask] = useState({
//     title: "",
//     description: "",
//     dueDate: "",
//   });

//   /* ================= FETCH TASKS ================= */
//   useEffect(() => {
//     const fetchTasks = async () => {
//       setLoading(true);
//       try {
//         const data: Task[] = [
//           {
//             id: "1",
//             projectId: "p1",
//             title: "Design Dashboard",
//             status: "pending",
//             assignee: "John Doe",
//             description: "Create wireframes and mockups.",
//             dueDate: new Date().toISOString(),
//           },
//           {
//             id: "2",
//             projectId: "p1",
//             title: "Fix API Bug",
//             status: "in-progress",
//             assignee: "John Doe",
//             description: "Fix timeout issue.",
//             dueDate: new Date().toISOString(),
//           },
//           {
//             id: "3",
//             projectId: "p2",
//             title: "Deploy App",
//             status: "completed",
//             assignee: "John Doe",
//             description: "Deploy to production.",
//             dueDate: new Date().toISOString(),
//           },
//         ];

//         setTasks(data);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, [memberId]);

//   /* ================= ACTIONS ================= */

//   const updateTaskStatus = (taskId: string, status: TaskStatus) => {
//     setTasks((prev) =>
//       prev.map((t) =>
//         t.id === taskId ? { ...t, status } : t
//       )
//     );
//   };

//   const editTask = (taskId: string) => {

//     const task = tasks.find((t) => t.id === taskId);
//     if (!task) return;
//     setNewTask({
//       title: task.title,
//       description: task.description || "",
//       dueDate: task.dueDate.split("T")[0],
//     });
//     setEditingTaskId(taskId);
//     setShowForm(true);
//   };

//   const deleteTask = (taskId: string) => {
//     setTasks((prev) =>
//       prev.filter((t) => t.id !== taskId)
//     );
//   };

//   const addTask = () => {
//     if (!newTask.title) return;

//     if (editingTaskId) {
//       setTasks((prev) =>
//         prev.map((t) =>
//           t.id === editingTaskId
//             ? {
//                 ...t,
//                 title: newTask.title,
//                 description: newTask.description,
//                 dueDate: newTask.dueDate,
//               }
//             : t
//         )
//       );
//       setEditingTaskId(null);
//     } else {

//     const task: Task = {
//       id: crypto.randomUUID(),
//       projectId: "p1",
//       title: newTask.title,
//       description: newTask.description,
//       dueDate: newTask.dueDate,
//       status: "pending",
//       assignee: "John Doe",
//     };

//     setTasks((prev) => [task, ...prev]);
//   }
//     setShowForm(false);
//     setNewTask({ title: "", description: "", dueDate: "" });
//   };

//   /* ================= SUMMARY ================= */
//   const summary = useMemo(
//     () => [
//       {
//         title: "Pending Task",
//         total: tasks.filter((t) => t.status === "pending").length,
//       },
//       {
//         title: "In Progress Task",
//         total: tasks.filter((t) => t.status === "in-progress").length,
//       },
//       {
//         title: "Completed Task",
//         total: tasks.filter((t) => t.status === "completed").length,
//       },
//     ],
//     [tasks]
//   );

//   /* ================= FILTER ================= */
//   const filteredTasks = useMemo(
//     () => tasks.filter((t) => t.status === activeStatus),
//     [tasks, activeStatus]
//   );

//   return (
//     <div className="p-4 w-full">
//       <h2 className="text-xl font-semibold mb-4">Tasks</h2>

//       {/* SUMMARY */}
//       <div className="flex gap-6 mb-6">
//         {summary.map((item) => (
//           <div
//             key={item.title}
//             className="bg-white p-4 rounded-lg border min-w-[160px]"
//           >
//             <h3 className="font-medium">{item.title}</h3>
//             <p className="text-sm text-gray-500">{item.total}</p>
//           </div>
//         ))}
//       </div>

//       {/* TABS + ADD BUTTON */}
//       <div className="flex justify-between mb-4">
//         <div className="flex gap-2">
//           {STATUS_TABS.map((tab) => (
//             <button
//               key={tab.value}
//               onClick={() => setActiveStatus(tab.value)}
//               className={`btn btn-sm ${
//                 activeStatus === tab.value
//                   ? "btn-primary"
//                   : "btn-ghost"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <button
//           className="btn btn-sm btn-primary"
//           onClick={() => setShowForm(true)}
//         >
//           + Add Task
//         </button>
//       </div>

//       {/* ADD TASK FORM */}
//       {showForm && (
//         <div className="bg-white p-4 mb-4 rounded-lg border space-y-3">
//           <input
//             className="input input-sm input-bordered w-full"
//             placeholder="Task title"
//             value={newTask.title}
//             onChange={(e) =>
//               setNewTask({ ...newTask, title: e.target.value })
//             }
//           />

//           <textarea
//             className="textarea textarea-sm textarea-bordered w-full"
//             placeholder="Description"
//             value={newTask.description}
//             onChange={(e) =>
//               setNewTask({
//                 ...newTask,
//                 description: e.target.value,
//               })
//             }
//           />

//           <input
//             type="date"
//             className="input input-sm input-bordered"
//             value={newTask.dueDate}
//             onChange={(e) =>
//               setNewTask({ ...newTask, dueDate: e.target.value })
//             }
//           />

//           <div className="flex gap-2">
//             <button
//               className="btn btn-sm btn-primary"
//               onClick={addTask}
//             >
//               Save
//             </button>
//             <button
//               className="btn btn-sm btn-ghost"
//               onClick={() => setShowForm(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* TABLE */}
//       <div className="overflow-x-auto">
//         {loading ? (
//           <p>Loading...</p>
//         ) : filteredTasks.length === 0 ? (
//           <p>No {activeStatus} tasks</p>
//         ) : (
//           <table className="table w-full">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Description</th>
//                 <th>Status</th>
//                 <th>Due</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTasks.map((task) => (
//                 <tr key={task.id}>
//                   <td>{task.title}</td>
//                   <td>{task.description}</td>
//                   <td>
//                     <TaskStatusSelect
//                       value={task.status}
//                       onChange={(s) =>
//                         updateTaskStatus(task.id, s)
//                       }
//                     />
//                   </td>
//                   <td>
//                     {new Date(task.dueDate).toLocaleDateString("en-IN")}

//                   </td>
//                   <td>
//                     <div className="flex gap-2">
//                     <button
//                       className="btn btn-xs btn-neutral"
//                       onClick={() => editTask(task.id)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="btn btn-xs btn-error"
//                       onClick={() => deleteTask(task.id)}
//                     >
//                       Delete
//                     </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MemberTask;

import type { Task } from "@/type/task";
import { useEffect, useMemo, useState } from "react";
import TaskStatusSelect from "../projects/TaskStatusSelect";
import { MdDelete, MdEdit } from "react-icons/md";
import API from "@/api/axios";
import { useAuth } from "@/auth/AuthContext";
import NewTaskModal from "../projects/NewTaskModal";
import TaskDrawer from "../task/TaskDrawer";
import { toast } from "react-toastify";


interface MemberTaskProps {
  memberId: string;
}

type TaskStatus = "pending" | "in-progress" | "completed";

const STATUS_TABS: { label: string; value: TaskStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

const MemberTask = ({ memberId }: MemberTaskProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [activeStatus, setActiveStatus] = useState<TaskStatus>("pending");

  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  /* ================= FETCH TASKS ================= */

  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     setLoading(true);
  //     try {
  //       const data: Task[] = [
  //         {
  //           id: "1",
  //           projectId: "p1",
  //           title: "Design Dashboard",
  //           status: "pending",
  //           assignee: "John Doe",
  //           description: "Create wireframes and mockups.",
  //           dueDate: new Date().toISOString(),
  //         },
  //         {
  //           id: "2",
  //           projectId: "p1",
  //           title: "Fix API Bug",
  //           status: "in-progress",
  //           assignee: "John Doe",
  //           description: "Fix timeout issue.",
  //           dueDate: new Date().toISOString(),
  //         },
  //         {
  //           id: "3",
  //           projectId: "p2",
  //           title: "Deploy App",
  //           status: "completed",
  //           assignee: "John Doe",
  //           description: "Deploy to production.",
  //           dueDate: new Date().toISOString(),
  //         },
  //       ];

  //       setTasks(data);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTasks();
  // }, [memberId]);

  const { auth } = useAuth();
  const slug = auth?.slug;
  const userId = auth?.user?.userId;
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);

      try {
        const { data } = await API.get(`/tasks/${slug}/getTasks`);

        if (data.success) {
          setTasks(data.data);
        }
      } catch (err) {
        console.error("Fetch tasks error", err);
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchTasks();
    }
  }, [memberId]);
  /* ================= ACTIONS ================= */

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );
  };

  const editTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setNewTask({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate.split("T")[0],
    });

    setEditingTaskId(taskId);
    setShowForm(true);
  };

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


  // const addTask = () => {
  //   if (!newTask.title) return;

  //   if (editingTaskId) {
  //     setTasks((prev) =>
  //       prev.map((t) =>
  //         t.id === editingTaskId
  //           ? {
  //               ...t,
  //               title: newTask.title,
  //               description: newTask.description,
  //               dueDate: newTask.dueDate,
  //             }
  //           : t,
  //       ),
  //     );
  //     setEditingTaskId(null);
  //   } else {
  //     const task: Task = {
  //       id: crypto.randomUUID(),
  //       projectId: "p1",
  //       title: newTask.title,
  //       description: newTask.description,
  //       dueDate: newTask.dueDate,
  //       status: "pending",
  //       assignee: "John Doe",
  //     };

  //     setTasks((prev) => [task, ...prev]);
  //   }

  //   setShowForm(false);
  //   setNewTask({ title: "", description: "", dueDate: "" });
  // };

  /* ================= SUMMARY ================= */

  const summary = useMemo(
    () => [
      {
        title: "Pending Task",
        total: tasks.filter((t) => t.status === "pending").length,
      },
      {
        title: "In Progress Task",
        total: tasks.filter((t) => t.status === "in-progress").length,
      },
      {
        title: "Completed Task",
        total: tasks.filter((t) => t.status === "completed").length,
      },
    ],
    [tasks],
  );

  /* ================= FILTER ================= */

  const filteredTasks = useMemo(
    () => tasks.filter((t) => t.status === activeStatus),
    [tasks, activeStatus],
  );

  return (
    <div className="p-4 w-full text-base-content">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {summary.map((item) => (
          <div key={item.title} className="bg-base-100 p-4 rounded-lg border">
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm opacity-70">{item.total}</p>
          </div>
        ))}
      </div>

      {/* TABS + ADD */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`btn btn-sm ${
                activeStatus === tab.value ? "btn-primary" : "btn-ghost"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* <button
          className="btn btn-sm btn-primary w-full sm:w-auto"
          onClick={() => setShowForm(true)}
        >
          + Add Task
        </button> */}
        <button
          className="btn btn-sm btn-primary w-full sm:w-auto"
          onClick={() => setShowTaskModal(true)}
        >
          + Add Task
        </button>
      </div>

      {/* FORM */}

      {showTaskModal && (
        <NewTaskModal
          onClose={() => setShowTaskModal(false)}
          projectId={undefined}
          userId={userId}
          hideAssignee
          onCreate={(task) => {
            setTasks((prev) => [task as Task, ...prev]);
          }}
        />
      )}

      {/* DESKTOP TABLE */}

      <div className="hidden md:block overflow-x-auto rounded-lg">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-screen bg-base-100 rounded-lg ">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-lg font-medium text-base-content/70">
              Loading...
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <p>No {activeStatus} tasks</p>
        ) : (
          <table className="table w-full border border-primary/60 rounded-lg">
            <thead className="bg-primary text-primary-content border-primary/60 rounded-lg">
              <tr>
                {/* <th>Title</th> */}
                <th>Task</th>
                <th>Status</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  onClick={() => {
                    setSelectedTask(task);
                    setDrawerMode("view");
                  }}
                  key={task.id}
                  className="border border-primary/60 text-base-content/80"
                >
                  <td>{task.title}</td>

                  <td>
                    <TaskStatusSelect
                      value={task.status}
                      onChange={(s) => updateTaskStatus(task.id, s)}
                    />
                  </td>

                  <td>{new Date(task.dueDate).toLocaleDateString("en-IN")}</td>

                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-success text-base-100"
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelectedTask(task);
                          setDrawerMode("edit");
                        }}
                      >
                        <MdEdit size={16} />
                      </button>

                      <button
                        className="btn btn-xs btn-error text-base-100"
                        onClick={(e) => {
    e.stopPropagation();
    handleDeleteTask(task);
  }}
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MOBILE CARDS */}

      {/* <div
        onClick={() => {
          setSelectedTask(task);
          setDrawerMode("view");
        }}
        className="md:hidden space-y-3"
      >
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className="bg-base-100 p-4 rounded-lg border space-y-2"
          >
            <h3 className="font-semibold">{task.title}</h3>

            <p className="text-sm opacity-70">{task.description}</p>

            <div className="flex justify-between items-center">
              <TaskStatusSelect
                value={task.status}
                onChange={(s) => updateTaskStatus(task._id, s)}
              />

              <span className="text-sm">
                {new Date(task.dueDate).toLocaleDateString("en-IN")}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-xs btn-success text-base-100"
                onClick={() => editTask(task._id)}
              >
                <MdEdit size={16} />
              </button>

              <button
                className="btn btn-xs btn-error text-base-100"
                onClick={(e) => {
    e.stopPropagation();
    handleDeleteTask(task);
  }}
              >
                <MdDelete size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          mode={drawerMode}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            setTasks((prev) =>
              prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
            );

            setSelectedTask(updatedTask);
          }}
        />
      )} */}

      {/* MOBILE + TABLET CARDS */}

<div className="md:hidden space-y-4">
  {loading ? (
    <div className="flex flex-col justify-center items-center py-16 bg-base-100 rounded-xl border border-primary/20">
      <span className="loading loading-spinner loading-lg text-primary"></span>

      <p className="mt-4 text-sm font-medium text-base-content/70">
        Loading tasks...
      </p>
    </div>
  ) : filteredTasks.length === 0 ? (
    <div className="bg-base-100 border border-primary/20 rounded-xl p-6 text-center">
      <p className="text-base-content/60">
        No {activeStatus} tasks found
      </p>
    </div>
  ) : (
    filteredTasks.map((task) => (
      <div
        key={task._id}
        onClick={() => {
          setSelectedTask(task);
          setDrawerMode("view");
        }}
        className="
          bg-base-100
          border
          border-primary/20
          rounded-2xl
          p-4
          shadow-sm
          active:scale-[0.98]
          transition-all
          space-y-4
        "
      >
        {/* TOP */}
        <div className="flex items-start justify-between gap-3">
          
          {/* LEFT */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base-content text-sm sm:text-base break-words">
              {task.title}
            </h3>

            <p className="text-xs sm:text-sm text-base-content/60 mt-1 break-words line-clamp-3">
              {task.description || "No description"}
            </p>
          </div>

          {/* ACTIONS */}
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-xs btn-success text-base-100"
              onClick={() => {
                setSelectedTask(task);
                setDrawerMode("edit");
              }}
            >
              <MdEdit size={14} />
            </button>

            <button
              className="btn btn-xs btn-error text-base-100"
              onClick={() => handleDeleteTask(task)}
            >
              <MdDelete size={14} />
            </button>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-auto"
          >
            <TaskStatusSelect
              value={task.status}
              onChange={(s) => updateTaskStatus(task._id, s)}
            />
          </div>

          <div className="text-xs sm:text-sm text-base-content/60 font-medium">
            Due:{" "}
            {new Date(task.dueDate).toLocaleDateString("en-IN")}
          </div>
        </div>
      </div>
    ))
  )}
</div>
    </div>
  );
};

export default MemberTask;
