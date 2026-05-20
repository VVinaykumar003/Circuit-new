
// import { useState, useEffect } from "react";
// import Input from "../ui/Input";
// import Select from "../ui/Select";
// import DateField from "../ui/DateField";
// import TagsInput from "../ui/TagsInput";
// import AssigneeSelect from "../ui/AssigneeSelect";
// import AttachmentInput from "../ui/AttachmentInput";
// import Checklist from "../ui/CheckList";
// import type { Tag } from "../../type/tag";

// import { useAuth } from "@/auth/AuthContext";
// import API from "@/api/axios";
// import type { ChecklistItem } from "@/type/task";
// import { toast } from "react-toastify";

// /* ================= TYPES ================= */

// type TaskStatus = "pending" | "in-progress" | "completed";
// type Priority = "low" | "medium" | "high";

// type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   assignee: string;
//   dueDate: string;
//   status: TaskStatus;
//   priority?: Priority;
//   tags?: Tag[];
//   attachments?: File[];
//   checklist?: ChecklistItem[];
// };

// interface Props {
//   onClose: () => void;
//   onCreate: (task: Task) => void;
//   projectId?: string; // optional now
// }

// type User = {
//   id: string;
//   name: string;
// };

// type Project = {
//   id: string;
//   name: string;
// };

// /* ================= COMPONENT ================= */

// export default function NewTaskModal({
//   onClose,
//   onCreate,
//   projectId,
// }: Props) {
//   const { auth } = useAuth();

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [assignee, setAssignee] = useState<User | null>(null);
//   const [assignees, setAssignees] = useState<User[]>([]);
//   const [dueDate, setDueDate] = useState("");
//   const [priority, setPriority] = useState<Priority>("medium");
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [checklist, setChecklist] = useState<
//     { id: string; text: string; completed: boolean }[]
//   >([]);
//   const [creating, setCreating] = useState(false);

//   const [selectedProject, setSelectedProject] = useState(projectId || "");
//   const [projects, setProjects] = useState<Project[]>([]);

//   /* ================= FETCH PROJECTS (dashboard use case) ================= */

//   useEffect(() => {
//     if (projectId) return;

//     const fetchProjects = async () => {
//       try {
//         const { data } = await API.get(
//           `/projects/${auth.slug}/getProjects`
//         );

//         if (data.success) {
//           const mapped = data.projects.map((p: any) => ({
//             id: p._id,
//             name: p.projectName,
//           }));
//           setProjects(mapped);
//         }
//       } catch (err) {
//         console.error("Project fetch error", err);
//       }
//     };

//     fetchProjects();
//   }, [projectId, auth.slug]);

//   /* ================= FETCH PARTICIPANTS ================= */

//   useEffect(() => {
//     if (!selectedProject) return;

//     const fetchParticipants = async () => {
//       try {
//         const { data } = await API.get(
//           `/projects/${auth.slug}/getProjectParticipants/${selectedProject}`
//         );

//         if (data.success) {
//           setAssignees(data.participants);
//         }
//       } catch (error) {
//         console.error("Error fetching participants", error);
//       }
//     };

//     fetchParticipants();
//   }, [selectedProject, auth.slug]);

//   /* ================= CREATE TASK ================= */

//   const handleCreateTask = async () => {
//     const trimmedTitle = title.trim();

//     if (trimmedTitle.length < 5) {
//       toast.error("Task title must be at least 5 characters long");
//       return;
//     }

//     // Basic gibberish detection (keyboard mashing or repeating characters)
//     if (/(.)\1{4,}/.test(trimmedTitle) || /^(asd|qwe|zxc|123)/i.test(trimmedTitle)) {
//       toast.error("Please enter a meaningful task title");
//       return;
//     }

//     try {
//       setCreating(true);

//       const formData = new FormData();

//       const cleanedSubtasks = checklist
//         .filter((item) => item.title.trim() !== "")
//         .map((item) => ({
//           title: item.title,
//           completed: item.completed,
//         }));

//       const cleanedTags = tags.map((t) => t.label);

//       formData.append("tag", JSON.stringify(cleanedTags));
//       formData.append("subtasks", JSON.stringify(cleanedSubtasks));

//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("priority", priority);
//       formData.append("status", "pending");
//       formData.append("assignedTo", assignee?.id || "");
//       formData.append("dueDate", dueDate);

//       attachments.forEach((file) => {
//         formData.append("attachments", file);
//       });

//       const { data } = await API.post(
//         `/tasks/${auth.slug}/addTasks/${selectedProject}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       if (data.success) {
//         const t = data.data;

//         onCreate({
//           id: t._id,
//           title: t.title,
//           description: t.description,
//           assignee: t.assignedTo?.name || "Unassigned",
//           dueDate: new Date(t.dueDate).toLocaleDateString(),
//           status: "pending",
//           priority: t.priority,
//           tags,
//           attachments,
//           checklist,
//         });
//         toast.success("Task created successfully");

//         onClose();
//       }
//     } catch (error) {
//       console.error("Task create error", error);
//     } finally {
//       setCreating(false);
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
//       <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl border border-base-300">
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 text-base-content">
//           <span className="text-lg font-semibold">Create Task</span>

//           <button className="btn btn-sm btn-ghost" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="p-6 space-y-6 text-base-content">
//           {/* PROJECT SELECT (dashboard case) */}
//           {!projectId && (
//             <Select
//               value={selectedProject}
//               onChange={(e) =>
//                 setSelectedProject(e.target.value)
//               }
//             >
//               <option value="">Select Project</option>
//               {projects.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name}
//                 </option>
//               ))}
//             </Select>
//           )}

//           {/* TITLE */}
//           <Input
//             autoFocus
//         placeholder="Task title (min 5 characters)"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//         maxLength={100}
//           />

//           {/* META */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <AssigneeSelect
//               users={assignees}
//               value={assignee ?? undefined}
//               onChange={setAssignee}
//             />

//             <DateField value={dueDate} onChange={setDueDate} />
//           </div>

//           {/* PRIORITY + TAGS */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Select
//               value={priority}
//               onChange={(e) =>
//                 setPriority(e.target.value as Priority)
//               }
//             >
//               <option value="low">Low</option>
//               <option value="medium">Medium</option>
//               <option value="high">High</option>
//             </Select>

//             <TagsInput value={tags} onChange={setTags} />
//           </div>

//           {/* DESCRIPTION */}
//           <textarea
//             rows={3}
//             placeholder="Add description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="textarea textarea-bordered w-full"
//           />

//           {/* ATTACHMENTS */}
//           <AttachmentInput
//             files={attachments}
//             onChange={setAttachments}
//           />

//           {/* CHECKLIST */}
//           <Checklist
//             value={checklist}
//             onChange={setChecklist}
//           />
//         </div>

//         {/* FOOTER */}
//         <div className="flex justify-end px-6 py-4 border-t border-base-300">
//           <button
//             className="btn btn-primary"
//             disabled={
//           !title.trim() ||
//               !assignee ||
//               !dueDate ||
//               !selectedProject ||
//               creating
//             }
//             onClick={handleCreateTask}
//           >
//             {creating ? "Creating..." : "Create Task"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import DateField from "../ui/DateField";
import TagsInput from "../ui/TagsInput";
import AssigneeSelect from "../ui/AssigneeSelect";
import AttachmentInput from "../ui/AttachmentInput";
import Checklist from "../ui/CheckList";
import type { Tag } from "../../type/tag";

import { useAuth } from "@/auth/AuthContext";
import API from "@/api/axios";
import type { ChecklistItem } from "@/type/task";
import { toast } from "react-toastify";

/* ================= TYPES ================= */

type TaskStatus = "pending" | "in-progress" | "completed";
type Priority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  dueDate: string;
  status: TaskStatus;
  priority?: Priority;
  tags?: Tag[];
  attachments?: File[];
  checklist?: ChecklistItem[];
  
};

interface Props {
  onClose: () => void;
  onCreate: (task: Task) => void;
  projectId?: string;
  userId?: string;
  hideAssignee?: boolean;
}

type User = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
};

/* ================= COMPONENT ================= */

export default function NewTaskModal({
  onClose,
  onCreate,
  projectId,
  userId,
  hideAssignee 
}: Props) {
  const { auth } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [assignee, setAssignee] = useState<User | null>(null);
 const [assignee, setAssignee] = useState<User | null>(
      userId ? { id: userId, name: "" } : null
);
  const [assignees, setAssignees] = useState<User[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState<Tag[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [checklist, setChecklist] = useState<
    { id: string; text: string; completed: boolean }[]
  >([]);
  const [creating, setCreating] = useState(false);

  const [selectedProject, setSelectedProject] = useState(projectId || "");
  const [projects, setProjects] = useState<Project[]>([]);

  /* ================= FETCH PROJECTS ================= */

  useEffect(() => {
    if (projectId) return;

    const fetchProjects = async () => {
      try {
        const { data } = await API.get(
          `/projects/${auth.slug}/getProjects`
        );

        if (data.success) {
          const mapped = data.projects.map((p: any) => ({
            id: p._id,
            name: p.projectName,
          }));
          setProjects(mapped);
        }
      } catch (err) {
        console.error("Project fetch error", err);
      }
    };

    fetchProjects();
  }, [projectId, auth.slug]);

  /* ================= FETCH PARTICIPANTS ================= */

  useEffect(() => {
    if (!selectedProject) return;

    const fetchParticipants = async () => {
      try {
        const { data } = await API.get(
          `/projects/${auth.slug}/getProjectParticipants/${selectedProject}`
        );

        if (data.success) {
          setAssignees(data.participants);
        }
      } catch (error) {
        console.error("Error fetching participants", error);
      }
    };

    fetchParticipants();
  }, [selectedProject, auth.slug]);

  /* ================= CREATE TASK ================= */

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 5) {
      toast.error("Task title must be at least 5 characters long");
      return;
    }

    if (/(.)\1{4,}/.test(trimmedTitle) || /^(asd|qwe|zxc|123)/i.test(trimmedTitle)) {
      toast.error("Please enter a meaningful task title");
      return;
    }

    try {
      setCreating(true);

      const formData = new FormData();

      const cleanedSubtasks = checklist
        .filter((item) => item.text.trim() !== "")
        .map((item) => ({
          title: item.text,
          completed: item.completed,
        }));

      const cleanedTags = tags.map((t) => t.label);

      formData.append("tag", JSON.stringify(cleanedTags));
      formData.append("subtasks", JSON.stringify(cleanedSubtasks));

      formData.append("title", title);
      formData.append("description", description);
      formData.append("priority", priority);
      formData.append("status", "pending");
      formData.append("assignedTo", assignee?.id || "");
      formData.append("dueDate", dueDate);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const { data } = await API.post(
        `/tasks/${auth.slug}/addTasks/${selectedProject}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        const t = data.data;

        onCreate({
          id: t._id,
          title: t.title,
          description: t.description,
          assignee: t.assignedTo?.name || "Unassigned",
          dueDate: new Date(t.dueDate).toLocaleDateString(),
          status: "pending",
          priority: t.priority,
          tags,
          attachments,
          checklist,
        });

        toast.success("Task created successfully");
        onClose();
      }
    } catch (error) {
      console.error("Task create error", error);
    } finally {
      setCreating(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-3 sm:px-4">
      <div
        className="
          w-[95%] sm:w-full max-w-2xl
          bg-base-100 rounded-2xl shadow-2xl border border-base-300
          max-h-[90vh] flex flex-col
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-base-300 bg-primary/80 rounded-t-2xl text-base-100">
          <span className="text-base sm:text-lg font-semibold">
            Create Task
          </span>

          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto text-base-content">
          {!projectId && (
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}

          <Input
            autoFocus
            placeholder="Task title (min 5 characters)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"> */}
          <div
  className={`grid gap-3 sm:gap-4 ${
    userId ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
  }`}
>
            {/* <AssigneeSelect
              users={assignees}
              value={assignee ?? undefined}
              onChange={setAssignee}
            /> */}
           {!hideAssignee && (
  <AssigneeSelect
    users={assignees}
    value={assignee ?? undefined}
    onChange={setAssignee}
  />
)}
            <DateField value={dueDate} onChange={setDueDate} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as Priority)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>

            <TagsInput value={tags} onChange={setTags} />
          </div>

          <textarea
            rows={3}
            placeholder="Add description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea border border-base-300 focus:outline-none  focus:ring-2 focus:ring-primary/40 rounded-lg w-full text-base-content placeholder:text-base-content/70"
          />

          <AttachmentInput
            files={attachments}
            onChange={setAttachments}
          />

          <Checklist value={checklist} onChange={setChecklist} />
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-base-300">
          <button
            className="btn btn-primary w-full sm:w-auto"
            disabled={
              !title.trim() ||
              !assignee ||
              !dueDate ||
              !selectedProject ||
              creating
            }
            onClick={handleCreateTask}
          >
            {creating ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}