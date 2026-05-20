// import { useEffect, useState } from "react";
// import {
//   getWorkUpdates,
//   editWorkUpdate,
//   deleteWorkUpdate,
// } from "@/services/workUpdateService";
// import { getProject } from "@/services/projectServices";
// import { MdDelete, MdEdit } from "react-icons/md";
// import Swal from "sweetalert2";
// import { toast } from "react-toastify";
// import { useAuth } from "@/auth/AuthContext";

// interface WorkUpdate {
//   _id: string;
//   description: string;
//   attachments: string[];
//   createdAt: string;
//   createdBy: {
//     name: string;
//     _id: string;
//   };
//   projectId: {
//     _id: string;

//     projectName: string;
//   };
// }

// const WorkUpdate = ({
//   slug,
//   projectId,
// }: {
//   slug: string;
//   projectId?: string;
// }) => {
//   const { auth } = useAuth();

//   const [updates, setUpdates] = useState<WorkUpdate[]>([]);
//   const [loading, setLoading] = useState(false);

//   // edit states
//   const [editProjectId, setEditProjectId] = useState("");
//   const [projects, setProjects] = useState([]);
//   const [editingUpdate, setEditingUpdate] = useState<WorkUpdate | null>(null);
//   const [editDescription, setEditDescription] = useState("");
//   const [editFiles, setEditFiles] = useState<File[]>([]);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const res = await getProject(slug);
//         setProjects(res.data.projects || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchProjects();
//   }, [slug]);

//   const fetchUpdates = async () => {
//     try {
//       setLoading(true);
//       const res = await getWorkUpdates(slug, { projectId });
//       setUpdates(res.data || []);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUpdates();
//   }, [slug, projectId]);

//   const handleDelete = async (id: string) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "This work update will be permanently deleted!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#ef4444",
//       cancelButtonColor: "#6b7280",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//       reverseButtons: true,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await deleteWorkUpdate(slug, id);
//       toast.success("Work update deleted successfully");
//       await fetchUpdates();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Failed to delete work update");
//     }
//   };

//   const handleEditSave = async () => {
//     if (!editingUpdate) return;

//     try {
//       const formData = new FormData();
//       formData.append("description", editDescription);

//       if (!projectId && editProjectId) {
//         formData.append("projectId", editProjectId);
//       }

//       if (editFiles.length > 0) {
//         editFiles.forEach((file) => {
//           formData.append("attachments", file);
//         });
//       }

//       await editWorkUpdate(slug, editingUpdate._id, formData);

//       toast.success("Work update updated successfully");

//       setEditingUpdate(null);
//       setEditFiles([]);
//       setEditDescription("");

//       await fetchUpdates();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Failed to update work update");
//     }
//   };
//   return (
//     <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-5">
//       <h2 className="text-sm font-medium text-base-content mb-4">
//         Work Updates
//       </h2>

//       {loading ? (
//         <p className="text-sm text-base-content/60">Loading...</p>
//       ) : updates.length === 0 ? (
//         <p className="text-sm text-base-content/60">No work updates yet </p>
//       ) : (
//         <div className="w-full overflow-x-auto">
//           <table className="min-w-[800px] w-full text-sm text-base-content">
//             {/* Header */}
//             <thead>
//               <tr className="border-b border-base-300 text-xs uppercase tracking-wide text-base-content/50">
//                 <th className="py-3 text-left min-w-[120px]">Project</th>
//                 <th className="py-3 text-left min-w-[200px]">Description</th>
//                 <th className="py-3 text-left min-w-[120px]">User</th>
//                 <th className="py-3 text-left min-w-[150px]">Files</th>
//                 <th className="py-3 text-left min-w-[150px]">Date</th>
//                 <th className="py-3 text-left min-w-[100px]">Action</th>
//               </tr>
//             </thead>

//             {/* Body */}
//             <tbody>
//               {updates.map((item) => (
//                 <tr
//                   key={item._id}
//                   className="border-b border-base-200 hover:bg-base-200/40 transition"
//                 >
//                   <td className="py-3">{item.projectId?.projectName}</td>

//                   <td className="py-3 max-w-[250px] truncate">
//                     {item.description}
//                   </td>

//                   <td className="py-3">{item.createdBy?.name}</td>

//                   <td className="py-3">
//                     {item.attachments.length > 0 ? (
//                       item.attachments.map((file, i) => (
//                         <a
//                           key={i}
//                           href={file}
//                           target="_blank"
//                           className="block text-xs text-primary hover:underline"
//                         >
//                           📎 File {i + 1}
//                         </a>
//                       ))
//                     ) : (
//                       <span className="text-xs text-base-content/50">
//                         No files
//                       </span>
//                     )}
//                   </td>

//                   <td className="py-3 text-xs text-base-content/50">
//                     {new Date(item.createdAt).toLocaleString("en-GB",{
//                       day: "2-digit",
//                       month: "short",
//                       year: "2-digit",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </td>

//                   <td className="py-3">
//                     <div className="flex items-center gap-3 min-w-[50px]">
//                       {auth?.user?.userId === item.createdBy._id ? (
//                         <button
//                           onClick={() => {
//                             setEditingUpdate(item);
//                             setEditDescription(item.description);
//                             setEditProjectId(item.projectId?._id || "");
//                             setEditFiles([]);
//                           }}
//                           className="text-primary hover:scale-110 transition"
//                         >
//                           <MdEdit size={16} />
//                         </button>
//                       ) : (
//                         <div className="w-[16px]" /> // 👈 placeholder (important!)
//                       )}

//                       {(auth?.user?.userId === item.createdBy._id ||
//                         ["admin", "owner"].includes(auth?.user?.role)) && (
//                         <button
//                           onClick={() => handleDelete(item._id)}
//                           className="text-error hover:scale-110 transition"
//                         >
//                           <MdDelete size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {editingUpdate && (
//         <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//           <div className="bg-base-100 p-6 rounded-2xl w-full max-w-md border border-base-300">
//             <h2 className="text-sm font-medium mb-4 text-base-content">
//               Edit Update
//             </h2>

//             {!projectId && (
//               <select
//                 value={editProjectId}
//                 onChange={(e) => setEditProjectId(e.target.value)}
//                 className="w-full px-3 py-2 text-sm border border-base-300 rounded-lg mb-3 bg-base-100"
//               >
//                 <option value="">Select project</option>
//                 {projects.map((p: any) => (
//                   <option key={p._id} value={p._id}>
//                     {p.projectName}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Description */}
//             <textarea
//               value={editDescription}
//               onChange={(e) => setEditDescription(e.target.value)}
//               className="w-full px-4 py-2 text-sm border border-base-300 rounded-lg mb-3 bg-base-100"
//             />

//             {/* Files */}
//             <input
//               type="file"
//               multiple
//               onChange={(e) =>
//                 setEditFiles(e.target.files ? Array.from(e.target.files) : [])
//               }
//               className="text-xs mb-3"
//             />

//             {/* Buttons */}
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setEditingUpdate(null)}
//                 className="px-3 py-1 text-xs border rounded-lg"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleEditSave}
//                 className="px-3 py-1 text-xs bg-primary text-primary-content rounded-lg"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WorkUpdate;

import { useEffect, useState } from "react";
import {
  getWorkUpdates,
  editWorkUpdate,
  deleteWorkUpdate,
} from "@/services/workUpdateService";
import { getProject } from "@/services/projectServices";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "@/auth/AuthContext";

interface WorkUpdate {
  _id: string;
  description: string;
  attachments: string[];
  createdAt: string;
  createdBy: {
    name: string;
    _id: string;
  };
  projectId: {
    _id: string;
    projectName: string;
  };
}

const WorkUpdate = ({
  slug,
  projectId,
}: {
  slug: string;
  projectId?: string;
}) => {
  const { auth } = useAuth();

  const [updates, setUpdates] = useState<WorkUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  const [editProjectId, setEditProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [editingUpdate, setEditingUpdate] = useState<WorkUpdate | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProject(slug);
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, [slug]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const res = await getWorkUpdates(slug, { projectId });
      setUpdates(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [slug, projectId]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete update?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteWorkUpdate(slug, id);
      toast.success("Deleted successfully");
      fetchUpdates();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleEditSave = async () => {
    if (!editingUpdate) return;

    try {
      const formData = new FormData();
      formData.append("description", editDescription);

      if (!projectId && editProjectId) {
        formData.append("projectId", editProjectId);
      }

      editFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      await editWorkUpdate(slug, editingUpdate._id, formData);

      toast.success("Updated successfully");
      setEditingUpdate(null);
      setEditFiles([]);
      setEditDescription("");
      fetchUpdates();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  return (
    <div>
      {/* <h2 className="text-sm font-semibold text-base-content mb-4">
        Work Updates
      </h2> */}

      {loading ? (
        <p className="text-sm text-base-content/60">Loading...</p>
      ) : updates.length === 0 ? (
        <p className="text-sm text-base-content/60">No updates yet</p>
      ) : (
        <div className="w-full bg-base-200 overflow-x-auto rounded-xl border border-primary/20 shadow-sm">
          <table className="min-w-[800px] w-full text-sm ">
            {/* HEADER */}
            <thead>
              <tr className="bg-primary text-md uppercase text-primary-content">
                <th className="py-3 px-4 text-left">Project</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Files</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {updates.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-primary/20 hover:bg-base-300/50 transition text-base-content text-sm"
                >
                  {/* Project */}
                  <td className="py-3 px-4 font-medium">
                    {item.projectId?.projectName}
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 max-w-[280px]">
                    <p className="line-clamp-2">{item.description}</p>
                  </td>

                  {/* User */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {item.createdBy?.name?.charAt(0)}
                      </div>
                      <span>{item.createdBy?.name}</span>
                    </div>
                  </td>

                  {/* Files */}
                  <td className="py-3 px-4">
                    {item.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.attachments.map((file, i) => (
                          <a
                            key={i}
                            href={file}
                            target="_blank"
                            className=" px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition"
                          >
                            File {i + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className=" text-base-content">
                        No files
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4  text-base-content whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3 ">
                    <div className="flex ml-5 gap-3 min-w-[60px]">
                      {/* EDIT */}
                      {auth?.user?.userId === item.createdBy._id ? (
                        <button
                          onClick={() => {
                            setEditingUpdate(item);
                            setEditDescription(item.description);
                            setEditProjectId(item.projectId?._id || "");
                            setEditFiles([]);
                          }}
                          className="text-primary hover:scale-110 transition"
                        >
                          <MdEdit size={16} />
                        </button>
                      ) : (
                        <div className="w-[16px]" /> // 👈 placeholder
                      )}

                      {/* DELETE */}
                      {(auth?.user?.userId === item.createdBy._id ||
                        ["admin", "owner"].includes(auth?.user?.role)) && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-error hover:scale-110 transition"
                        >
                          <MdDelete size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {/* {editingUpdate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-2xl w-full max-w-md border border-primary/20 shadow-xl">
            <h2 className="text-sm font-semibold mb-4">Edit Update</h2>

            {!projectId && (
              <select
                value={editProjectId}
                onChange={(e) => setEditProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 rounded-lg mb-3"
              >
                <option value="">Select project</option>
                {projects.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            )}

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border border-primary/20 rounded-lg mb-3"
            />

            <input
              type="file"
              multiple
              onChange={(e) =>
                setEditFiles(e.target.files ? Array.from(e.target.files) : [])
              }
              className="mb-3 text-sm border border-primary/20 rounded-lg px-2 py-1"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingUpdate(null)}
                className="px-4 py-2 text-sm bg-base-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )} */}

      {editingUpdate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
    
    <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-6 animate-[fadeIn_.2s_ease]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-base-content">
          Edit Update
        </h2>

        <button
          onClick={() => setEditingUpdate(null)}
          className="text-base-content/50 hover:text-error transition"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">

        {/* PROJECT */}
        {!projectId && (
          <div>
            <label className="text-xs  font-medium text-base-content/60 mb-1.5 block">
              Project
            </label>

           <div className="relative w-full">
  <select
    value={editProjectId}
    onChange={(e) => setEditProjectId(e.target.value)}
    className="w-full appearance-none px-4 py-2.5 pr-12 text-sm rounded-xl 
    border border-primary/20 bg-base-100 text-base-content
    focus:outline-none focus:ring-2 focus:ring-primary/30 
    transition"
  >
    <option value="">Select project</option>
    {projects.map((p: any) => (
      <option key={p._id} value={p._id}>
        {p.projectName}
      </option>
    ))}
  </select>

  {/* Custom Arrow */}
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-base-content/50">
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
          </div>
        )}

        {/* DESCRIPTION */}
        <div>
          <label className="text-xs  font-medium text-base-content/60 mb-1.5 block">
            Description
          </label>

          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm rounded-xl border border-primary/20 bg-base-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30  transition text-base-content/60"
          />
        </div>

        {/* FILE */}
        <div>
          <label className="text-xs  font-medium text-base-content/60 mb-1.5 block">
            Attach Files
          </label>

          <input
            type="file"
            multiple
            onChange={(e) =>
              setEditFiles(
                e.target.files ? Array.from(e.target.files) : []
              )
            }
            className="w-full text-sm text-base-content/70 
            file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 
            file:text-sm file:bg-base-200 file:text-base-content 
            hover:file:bg-base-300"
          />
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-6">
        
        <button
          onClick={() => setEditingUpdate(null)}
          className="px-4 py-2 text-sm rounded-xl bg-base-200 hover:bg-base-300 transition text-base-content/80"
        >
          Cancel
        </button>

        <button
          onClick={handleEditSave}
          className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-content hover:opacity-90 transition"
        >
          Save Changes
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default WorkUpdate;
