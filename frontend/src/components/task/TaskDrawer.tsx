
// import { MdClose } from "react-icons/md";
// import { useState, useEffect } from "react";
// import Input from "../ui/Input";
// import Select from "../ui/Select";
// import DateField from "../ui/DateField";
// import TagsInput from "../ui/TagsInput";
// import AssigneeSelect from "../ui/AssigneeSelect";
// import AttachmentInput from "../ui/AttachmentInput";
// import Checklist from "../ui/CheckList";

// import { useAuth } from "@/auth/AuthContext";
// import API from "@/api/axios";
// import type { Tag } from "../../type/tag";
// import type { Task } from "../../type/task";

// type Priority = "low" | "medium" | "high";

// interface Props {
//   task: Task | null;
//   mode?: "view" | "edit";
//   onClose: () => void;
//   onUpdate: (task: Task) => void;
// }

// type User = {
//   id: string;
//   name: string;
// };

// export default function TaskDrawer({
//   task,
//   mode = "view",
//   onClose,
//   onUpdate,
// }: Props) {
//   const { auth } = useAuth();
//   const isEdit = mode === "edit";

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [assignee, setAssignee] = useState<User | null>(null);
//   const [assignees, setAssignees] = useState<User[]>([]);
//   const [dueDate, setDueDate] = useState("");
//   const [priority, setPriority] = useState<Priority>("medium");
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [checklist, setChecklist] = useState<
//     { _id: string; title: string; completed: boolean }[]
//   >([]);
//   const [updating, setUpdating] = useState(false);

//   /* LOAD TASK DATA */

//   useEffect(() => {
//     if (!task) return;
//     console.log("Loading task data into drawer", task);
//     setTitle(task.title);
//     setDescription(task.description || "");
//     setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
//     setPriority((task.priority as Priority) || "medium");

//     const parsedTags =
//       task.tag?.flatMap((t) => {
//         try {
//           const parsed = JSON.parse(t);
//           return parsed.map((label: string) => ({
//             label: label.trim(),
//           }));
//         } catch {
//           return [{ label: String(t).trim() }];
//         }
//       }) || [];

//     setTags(parsedTags);
//     const parsedChecklist =
//       task.subtasks?.map((s) => ({
//         _id: s._id,
//         title: s.title,
//         completed: s.completed,
//       })) || [];

//     setChecklist(parsedChecklist);
//   }, [task]);

//   /* FETCH PARTICIPANTS */

//   useEffect(() => {
//     const fetchParticipants = async () => {
//       try {
//         const { data } = await API.get(
//           `/projects/${auth.slug}/getProjectParticipants/${task?.projectId}`,
//         );

//         if (data.success) {
//           setAssignees(data.participants);

//           if (task?.assignedTo?.[0]) {
//             setAssignee({
//               id: task.assignedTo[0]._id,
//               name: task.assignedTo[0].name,
//             });
//           }
//         }
//       } catch (err) {
//         console.error("Participant fetch error", err);
//       }
//     };

//     if (task?.projectId) fetchParticipants();
//   }, [task?.projectId, auth.slug]);

//   /* UPDATE TASK */

//   const handleUpdateTask = async () => {
//     try {
//       if (!task) return;
//       setUpdating(true);

//       const formData = new FormData();

//       const cleanedSubtasks = checklist
//         .filter((c) => c.title.trim() !== "")
//         .map((c) => ({
//           _id: c._id,
//           title: c.title,
//           completed: c.completed,
//         }));
//       const cleanedTags = tags.map((t) => t.label);

//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("priority", priority);
//       formData.append("assignedTo", assignee?.id || "");
//       formData.append("dueDate", dueDate);
//       formData.append("tag", JSON.stringify(cleanedTags));
//       formData.append("subtasks", JSON.stringify(cleanedSubtasks));

//       attachments.forEach((file) => {
//         formData.append("attachments", file);
//       });

//       const { data } = await API.put(
//         `/tasks/${auth.slug}/updateTask/${task.projectId}/${task._id}`,
//         formData,
//       );

//       if (data.success) {
//         onUpdate(data.data);
//         onClose();
//       }
//     } catch (error) {
//       console.error("Update task error", error);
//     } finally {
//       setUpdating(false);
//     }
//   };
//   const toggleSubtask = async (subtaskId: string) => {
//     try {
//       if (!task) return;

//       const { data } = await API.patch(
//         `/tasks/${auth.slug}/updateSubtaskStatus/${task.projectId}/${task._id}/${subtaskId}`,
//       );

//       if (data.success) {
//         const updatedSubtask = data.data;

//         setChecklist((prev) =>
//           prev.map((item) =>
//             item._id === updatedSubtask._id
//               ? { ...item, completed: updatedSubtask.completed }
//               : item,
//           ),
//         );

//         // parent task update
//         onUpdate({
//           ...task,
//           subtasks: checklist.map((item) =>
//             item._id === updatedSubtask._id
//               ? { ...item, completed: updatedSubtask.completed }
//               : item,
//           ),
//         });
//       }
//     } catch (err) {
//       console.error("Subtask toggle error", err);
//     }
//   };
//   if (!task) return null;

//   return (
//     <>
//       {/* BACKDROP */}
//       <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

//       {/* DRAWER */}
//       <div className="fixed right-0 top-0 h-full w-full max-w-md bg-base-100 z-50 border-l border-base-300 shadow-xl flex flex-col">
//         {/* HEADER */}
//         <div className="flex items-center justify-between p-5 border-b border-base-300">
//           <h3 className="text-lg font-semibold">
//             {isEdit ? "Edit Task" : "Task Details"}
//           </h3>

//           <button onClick={onClose} className="btn btn-sm btn-ghost">
//             <MdClose size={18} />
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="flex-1 overflow-y-auto p-5 space-y-5">
//           {/* TITLE */}
//           {isEdit ? (
//             <Input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Task title"
//             />
//           ) : (
//             <h2 className="text-lg font-semibold">{title}</h2>
//           )}

//           {/* ASSIGNEE */}
//           {isEdit ? (
//             <AssigneeSelect
//               users={assignees}
//               value={assignee ?? undefined}
//               onChange={setAssignee}
//             />
//           ) : (
//             <div className="badge badge-outline">
//               {assignee?.name || "Unassigned"}
//             </div>
//           )}

//           {/* DUE DATE */}
//           {isEdit ? (
//             <DateField value={dueDate} onChange={setDueDate} />
//           ) : (
//             <div className="text-sm opacity-70">
//               {dueDate
//                 ? new Date(dueDate).toLocaleDateString("en-GB")
//                 : "No due date"}
//             </div>
//           )}

//           {/* PRIORITY */}
//           {isEdit ? (
//             <Select
//               value={priority}
//               onChange={(e) => setPriority(e.target.value as Priority)}
//             >
//               <option value="low">Low</option>
//               <option value="medium">Medium</option>
//               <option value="high">High</option>
//             </Select>
//           ) : (
//             <div
//               className={`p-1.5 badge ${
//                 priority === "high"
//                   ? "badge-error"
//                   : priority === "medium"
//                     ? "badge-warning"
//                     : "badge-success"
//               }`}
//             >
//               {priority}
//             </div>
//           )}

//           {/* TAGS */}
//           {isEdit ? (
//             <TagsInput value={tags} onChange={setTags} />
//           ) : (
//             <div className="flex flex-wrap gap-2">
//               {tags.length ? (
//                 tags.map((tag) => (
//                   <span key={tag.id} className="badge badge-outline">
//                     {tag.label}
//                   </span>
//                 ))
//               ) : (
//                 <span className="text-sm opacity-60">No tags</span>
//               )}
//             </div>
//           )}

//           {/* DESCRIPTION */}
//           {isEdit ? (
//             <textarea
//               className="textarea textarea-bordered w-full"
//               rows={3}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           ) : (
//             <p className="text-sm">{description || "No description"}</p>
//           )}

//           {/* ATTACHMENTS */}
//           {isEdit ? (
//             <AttachmentInput files={attachments} onChange={setAttachments} />
//           ) : (
//             <div className="space-y-2">
//               {task.attachments?.length ? (
//                 task.attachments.map((file: any) => (
//                   <a
//                     key={file}
//                     href={file}
//                     target="_blank"
//                     className="link link-primary block"
//                   >
//                     Attachment
//                   </a>
//                 ))
//               ) : (
//                 <span className="text-sm opacity-60">No attachments</span>
//               )}
//             </div>
//           )}

//           {isEdit ? (
//             <Checklist value={checklist} onChange={setChecklist} />
//           ) : (
//             <div className="space-y-2">
//               {checklist.length === 0 && (
//                 <p className="text-sm opacity-60">No checklist</p>
//               )}

//               {checklist.map((item) => (
//                 <div key={item._id} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={item.completed}
//                     onChange={() => !updating && toggleSubtask(item._id)}
//                     className="checkbox checkbox-sm cursor-pointer"
//                   />
//                   <span
//                     className={item.completed ? "line-through opacity-60" : ""}
//                   >
//                     {item.title}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* FOOTER */}
//         {isEdit && (
//           <div className="p-5 border-t border-base-300">
//             <button
//               className="btn btn-primary w-full"
//               onClick={handleUpdateTask}
//               disabled={updating}
//             >
//               {updating ? "Updating..." : "Update Task"}
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }



import {
  MdClose,
  MdTitle,
  MdPerson,
  MdCalendarToday,
  MdFlag,
  MdLocalOffer,
  MdDescription,
  MdAttachFile,
  MdChecklist,
} from "react-icons/md";

import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import DateField from "../ui/DateField";
import TagsInput from "../ui/TagsInput";
import AssigneeSelect from "../ui/AssigneeSelect";
import AttachmentInput from "../ui/AttachmentInput";
import Checklist from "../ui/CheckList";

import { useAuth } from "@/auth/AuthContext";
import API from "@/api/axios";
import type { Tag } from "../../type/tag";
import type { Task } from "../../type/task";

type Priority = "low" | "medium" | "high";

interface Props {
  task: Task | null;
  mode?: "view" | "edit";
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

type User = {
  id: string;
  name: string;
};
// function Section({
//   icon,
//   label,
//   children,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="grid grid-cols-[22px_1fr] gap-x-3 gap-y-1">
//       <div className="text-base-content mt-[2px]">{icon}</div>

//       <p className="text-xs font-semibold uppercase tracking-wide text-base-content">
//         {label}
//       </p>

//       <div />
//       <div className="text-sm">{children}</div>
//     </div>
//   );
// }
function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[18px_1fr] sm:grid-cols-[22px_1fr] gap-x-2 sm:gap-x-3 gap-y-1">
      
      <div className="text-base-content mt-[2px] shrink-0">
        {icon}
      </div>

      <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-base-content break-words">
        {label}
      </p>

      <div />

      <div className="text-sm min-w-0">
        {children}
      </div>
    </div>
  );
}
export default function TaskDrawer({
  task,
  mode = "view",
  onClose,
  onUpdate,
}: Props) {
  console.log("Rendering TaskDrawer with task:", task, "and mode:", mode);
  const { auth } = useAuth();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<User | null>(null);
  const [assignees, setAssignees] = useState<User[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState<Tag[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [checklist, setChecklist] = useState<
    { _id: string; title: string; completed: boolean }[]
  >([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!task) return;

    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setPriority((task.priority as Priority) || "medium");

    const parsedTags =
      task.tag?.flatMap((t) => {
        try {
          const parsed = JSON.parse(t);
          return parsed.map((label: string) => ({
            label: label.trim(),
          }));
        } catch {
          return [{ label: String(t).trim() }];
        }
      }) || [];

    setTags(parsedTags);

    const parsedChecklist =
      task.subtasks?.map((s) => ({
        _id: s._id,
        title: s.title,
        completed: s.completed,
      })) || [];

    setChecklist(parsedChecklist);
  }, [task]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data } = await API.get(
          `/projects/${auth.slug}/getProjectParticipants/${task?.projectId}`,
        );

        if (data.success) {
          setAssignees(data.participants);

          if (task?.assignedTo?.[0]) {
            setAssignee({
              id: task.assignedTo[0]._id,
              name: task.assignedTo[0].name,
            });
          }
        }
      } catch (err) {
        console.error("Participant fetch error", err);
      }
    };

    if (task?.projectId) fetchParticipants();
  }, [task?.projectId, auth.slug]);

  const handleUpdateTask = async () => {
    try {
      if (!task) return;
      setUpdating(true);

      const formData = new FormData();

      const cleanedSubtasks = checklist
        .filter((c) => c.title.trim() !== "")
        .map((c) => ({
          _id: c._id,
          title: c.title,
          completed: c.completed,
        }));

      const cleanedTags = tags.map((t) => t.label);

      formData.append("title", title);
      formData.append("description", description);
      formData.append("priority", priority);
      formData.append("assignedTo", assignee?.id || "");
      formData.append("dueDate", dueDate);
      formData.append("tag", JSON.stringify(cleanedTags));
      formData.append("subtasks", JSON.stringify(cleanedSubtasks));

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const { data } = await API.put(
        `/tasks/${auth.slug}/updateTask/${task.projectId}/${task._id}`,
        formData,
      );

      if (data.success) {
        onUpdate(data.data);
        onClose();
      }
    } catch (error) {
      console.error("Update task error", error);
    } finally {
      setUpdating(false);
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    try {
      if (!task) return;

      const { data } = await API.patch(
        `/tasks/${auth.slug}/updateSubtaskStatus/${task.projectId}/${task._id}/${subtaskId}`,
      );

      if (data.success) {
        const updatedSubtask = data.data;

        setChecklist((prev) =>
          prev.map((item) =>
            item._id === updatedSubtask._id
              ? { ...item, completed: updatedSubtask.completed }
              : item,
          ),
        );

        onUpdate({
          ...task,
          subtasks: checklist.map((item) =>
            item._id === updatedSubtask._id
              ? { ...item, completed: updatedSubtask.completed }
              : item,
          ),
        });
      }
    } catch (err) {
      console.error("Subtask toggle error", err);
    }
  };

  if (!task) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 text-base-content" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-base-100 z-50 border-l border-base-300 shadow-xl flex flex-col">
   
        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-primary/20">
          <h3 className="text-lg font-semibold text-base-content">
            {isEdit ? "Edit Task" : "Task Details"}
          </h3>

          <button onClick={onClose} className="btn btn-sm btn-ghost text-base-content">
            <MdClose size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-7 text-base-content">

          <Section icon={<MdTitle />} label="Title">
            {isEdit ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            ) : (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
          </Section>

          <Section icon={<MdPerson />} label="Assignee">
            {isEdit ? (
              <AssigneeSelect
                users={assignees}
                value={assignee ?? undefined}
                onChange={setAssignee}
              />
            ) : (
              <div className="badge badge-outline  py-2">
                {assignee?.name || "Unassigned"}
              </div>
            )}
          </Section>

          <Section icon={<MdCalendarToday />} label="Due Date">
            {isEdit ? (
              <DateField value={dueDate} onChange={setDueDate} />
            ) : (
              <div className="text-sm">
                {dueDate
                  ? new Date(dueDate).toLocaleDateString("en-GB")
                  : "No due date"}
              </div>
            )}
          </Section>

          <Section icon={<MdFlag />} label="Priority">
            {isEdit ? (
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            ) : (
              <div
                className={`text-white p-2 badge ${
                  priority === "high"
                    ? "badge-error"
                    : priority === "medium"
                    ? "badge-warning"
                    : "badge-success"
                }`}
              >
                {priority}
              </div>
            )}
          </Section>

          <Section icon={<MdLocalOffer />} label="Tags">
            {isEdit ? (
              <TagsInput value={tags} onChange={setTags} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.length ? (
                  tags.map((tag, i) => (
                    <span key={i} className="badge badge-outline">
                      {tag.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm ">No tags</span>
                )}
              </div>
            )}
          </Section>

          <Section icon={<MdDescription />} label="Description">
            {isEdit ? (
              <textarea
                className="textarea textarea-bordered border rounded-lg w-full"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            ) : (
              <p className="text-sm">
                {description || "No description provided"}
              </p>
            )}
          </Section>

          <Section icon={<MdAttachFile />} label="Attachments">
            {isEdit ? (
              <AttachmentInput
                files={attachments}
                onChange={setAttachments}
              />
            ) : (
              <div className="space-y-2">
                {task.attachments?.length ? (
                  task.attachments.map((file: any) => (
                    <a
                      key={file}
                      href={file}
                      target="_blank"
                      className="link link-primary block text-sm"
                    >
                      View Attachment
                    </a>
                  ))
                ) : (
                  <span className="text-sm ">
                    No attachments
                  </span>
                )}
              </div>
            )}
          </Section>

          <Section icon={<MdChecklist />} label="Checklist">
            {isEdit ? (
              <Checklist value={checklist} onChange={setChecklist} />
            ) : (
              <div className="space-y-3 w-full">
                {checklist.length === 0 && (
                  <p className="text-sm ">
                    No checklist items
                  </p>
                )}

                {checklist.map((item) => (
                  <div key={item._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        !updating && toggleSubtask(item._id)
                      }
                     className="checkbox  checkbox-sm  border border-base-400 cursor-pointer mt-1"
                    />
                    <span
                      className={
                        item.completed
                          ? "line-through opacity-60"
                          : ""
                      }
                    >
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {isEdit && (
          <div className="p-10 border-t border-base-300 flex items-center justify-center">
            <button
              className="btn btn-primary w-full"
              onClick={handleUpdateTask}
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Task"}
            </button>
          </div>
        )} 
       
      </div>
    </>
 
 
  );
}