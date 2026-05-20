// import { useState, useEffect } from "react";
// import type { Project, Participant } from "../../type/project";
// import { useAuth } from "@/auth/AuthContext";
// import API from "@/api/axios";
// import { getMembers } from "@/services/memberService";

// interface Props {
//   project: Project | null;
//   open: boolean;
//   onClose: () => void;
//   onSave: (updated: Project) => void;
// }

// interface OrgUser {
//   _id: string;
//   name: string;
//   role: string;
// }

// const roles = ["Member", "Manager"];

// const responsibilities = [
//   "Frontend Development",
//   "Backend Development",
//   "Full Stack Development",
//   "Debugging",
//   "Content",
//   "Research",
//   "Maintain",
//   "UI Design",
//   "Testing",
//   "Deployment",
// ];

// const domains = [
//   "Web Development",
//   "App Development",
//   "AI/ML",
//   "Social Media",
//   "Block Chain",
//   "Content Creation",
//   "Content Writing",
//   "Testing",
//   "Software Development",
//   "Other",
// ];

// export default function EditProjectModal({
//   project,
//   open,
//   onClose,
//   onSave,
// }: Props) {
//   const { auth } = useAuth();

//   const [name, setName] = useState("");
//   const [status, setStatus] = useState<Project["status"]>("Active");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [domain, setDomain] = useState("");
//   const [customDomain, setCustomDomain] = useState("");
//   const [description, setDescription] = useState("");
//   const [participants, setParticipants] = useState<Participant[]>([]);
//   const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);

//   const [newParticipant, setNewParticipant] = useState<Participant>({
//     user: "",
//     role: "",
//     responsibility: "",
//   });

//   useEffect(() => {
//     if (!project) return;

//     setName(project.name || "");
//     setStatus(project.status || "Active");
//     setStartDate(project.startDate || "");
//     setEndDate(project.endDate || "");
//     setDomain(project.domain || "");
//     setCustomDomain(project.customDomain || "");
//     setDescription(project.description || "");

//     setParticipants(
//       (project.participants || []).map((p) => ({
//         ...p,
//         user: typeof p.user === "object" ? p.user._id : p.user,
//       }))
//     );
//   }, [project]);

//   useEffect(() => {
//     const fetchMembers = async () => {
//       try {
//         const res = await getMembers(auth.slug);
//         API.get(`/${auth.slug}/getMembers`);
//         setOrgUsers(res.data.members || res.data.users || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchMembers();
//   }, [auth.slug]);

//   if (!open || !project) return null;

//   const formatDate = (d?: string | Date) =>
//     d ? new Date(d).toISOString().split("T")[0] : "";

//   const addParticipant = () => {
//     if (
//       !newParticipant.user ||
//       !newParticipant.role ||
//       !newParticipant.responsibility
//     )
//       return;

//     const alreadyExists = participants.some(
//       (p) => p.user === newParticipant.user
//     );

//     if (alreadyExists) return;

//     setParticipants([
//       ...participants,
//       {
//         ...newParticipant,
//         user: newParticipant.user,
//       },
//     ]);

//     setNewParticipant({
//       user: "",
//       role: "",
//       responsibility: "",
//     });
//   };

//   const removeParticipant = (userId: string) => {
//     setParticipants(participants.filter((p) => p.user !== userId));
//   };

//   return (
//     // <div className="fixed inset-0 z-50 flex items-center justify-center">
//     //   <div className="absolute inset-0 bg-black/40" onClick={onClose} />

//     //   <div className="relative bg-base-100 text-base-content rounded-xl p-6 w-full max-w-md space-y-4 overflow-auto max-h-[90vh]">
//     //     <h3 className="text-lg font-semibold">Edit Project</h3>

//     //     {/* Project Name */}
//     //     <input
//     //       value={name}
//     //       onChange={(e) => setName(e.target.value)}
//     //       className="input input-bordered w-full"
//     //       placeholder="Project Name"
//     //     />

//     //     {/* Status */}
//     //     <select
//     //       value={status}
//     //       onChange={(e) => setStatus(e.target.value as Project["status"])}
//     //       className="select select-bordered w-full"
//     //     >
//     //       <option value="Active">Active</option>
//     //       <option value="On Hold">On Hold</option>
//     //       <option value="Completed">Completed</option>
//     //     </select>

//     //     {/* Dates */}
//     //     <input
//     //       type="date"
//     //       value={formatDate(startDate)}
//     //       onChange={(e) => setStartDate(e.target.value)}
//     //       className="input input-bordered w-full"
//     //     />

//     //     <input
//     //       type="date"
//     //       value={formatDate(endDate)}
//     //       onChange={(e) => setEndDate(e.target.value)}
//     //       className="input input-bordered w-full"
//     //     />

//     //     {/* Domain */}
//     //     <select
//     //       value={domain}
//     //       onChange={(e) => setDomain(e.target.value)}
//     //       className="select select-bordered w-full"
//     //     >
//     //       <option value="">Select Domain</option>
//     //       {domains.map((d) => (
//     //         <option key={d} value={d}>
//     //           {d}
//     //         </option>
//     //       ))}
//     //     </select>

//     //     {/* Custom Domain */}
//     //     {domain === "Other" && (
//     //       <input
//     //         value={customDomain}
//     //         onChange={(e) => setCustomDomain(e.target.value)}
//     //         className="input input-bordered w-full"
//     //         placeholder="Enter Custom Domain"
//     //       />
//     //     )}

//     //     {/* Description */}
//     //     <textarea
//     //       value={description}
//     //       onChange={(e) => setDescription(e.target.value)}
//     //       className="textarea textarea-bordered w-full"
//     //       placeholder="Description"
//     //     />

//     //     {/* Participants */}
//     //     <div>
//     //       <h4 className="font-medium mb-2">Participants</h4>

//     //       {participants.map((p) => {
//     //         const user = orgUsers.find((u) => u._id === p.user);

//     //         return (
//     //           <div key={p.user} className="flex items-center gap-2 mb-2 overflow-hidden">
//     //             <span className="flex-1">
//     //               {user?.name || "Unknown"} ({p.role})
//     //             </span>
//     //             <hr className="text-gray-800 w-0.5 h-full"/>
//     //             <span className="flex-1">{p.responsibility}</span>

//     //             <button
//     //               className="btn btn-sm btn-error text-secondary-content"
//     //               onClick={() => removeParticipant(p.user)}
//     //             >
//     //               Remove
//     //             </button>
//     //           </div>
//     //         );
//     //       })}

//     //       {/* Add Participant */}
//     //       <div className="flex gap-2 mt-2">
//     //         <select
//     //           value={newParticipant.user}
//     //           onChange={(e) =>
//     //             setNewParticipant({
//     //               ...newParticipant,
//     //               user: e.target.value,
//     //             })
//     //           }
//     //           className="select select-bordered flex-1"
//     //         >
//     //           <option value="">Select User</option>
//     //           {orgUsers.map((u) => (
//     //             <option key={u._id} value={u._id}>
//     //               {u.name} ({u.role})
//     //             </option>
//     //           ))}
//     //         </select>

//     //         <select
//     //           value={newParticipant.role}
//     //           onChange={(e) =>
//     //             setNewParticipant({
//     //               ...newParticipant,
//     //               role: e.target.value,
//     //             })
//     //           }
//     //           className="select select-bordered flex-1"
//     //         >
//     //           <option value="">Role</option>
//     //           {roles.map((r) => (
//     //             <option key={r}>{r}</option>
//     //           ))}
//     //         </select>

//     //         <select
//     //           value={newParticipant.responsibility}
//     //           onChange={(e) =>
//     //             setNewParticipant({
//     //               ...newParticipant,
//     //               responsibility: e.target.value,
//     //             })
//     //           }
//     //           className="select select-bordered flex-1"
//     //         >
//     //           <option value="">Responsibility</option>
//     //           {responsibilities.map((r) => (
//     //             <option key={r}>{r}</option>
//     //           ))}
//     //         </select>

//     //         <button className="btn btn-primary btn-sm" onClick={addParticipant}>
//     //           Add
//     //         </button>
//     //       </div>
//     //     </div>

//     //     {/* Buttons */}
//     //     <div className="flex justify-end gap-2">
//     //       <button className="btn btn-ghost" onClick={onClose}>
//     //         Cancel
//     //       </button>

//     //       <button
//     //         className="btn btn-primary"
//     //         onClick={() =>
//     //           onSave({
//     //             ...project,
//     //             name,
//     //             status,
//     //             startDate,
//     //             endDate,
//     //             domain,
//     //             customDomain,
//     //             description,
//     //             participants,
//     //           })
//     //         }
//     //       >
//     //         Save
//     //       </button>
//     //     </div>
//     //   </div>
//     // </div>

//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//   {/* BACKDROP */}
//   <div
//     className="absolute inset-0 bg-black/40 "
//     onClick={onClose}
//   />

//   {/* MODAL */}
//   <div className="relative bg-base-100 text-base-content rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto space-y-6">

//     {/* HEADER */}
//     <div className="flex justify-between items-center border-b border-base-300/60 pb-3">
//       <h3 className="text-xl font-semibold">Edit Project</h3>
//       <button onClick={onClose} className="btn btn-sm btn-ghost">✕</button>
//     </div>

//     {/* BASIC INFO */}
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <input
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="input border-base-content input-bordered w-full"
//         placeholder="Project Name"
//       />

//       <select
//         value={status}
//         onChange={(e) => setStatus(e.target.value as Project["status"])}
//         className="select select-bordered w-full"
//       >
//         <option value="Active">Active</option>
//         <option value="On Hold">On Hold</option>
//         <option value="Completed">Completed</option>
//       </select>

//       <input
//         type="date"
//         value={formatDate(startDate)}
//         onChange={(e) => setStartDate(e.target.value)}
//         className="input  input-bordered w-full"
//       />

//       <input
//         type="date"
//         value={formatDate(endDate)}
//         onChange={(e) => setEndDate(e.target.value)}
//         className="input input-bordered w-full"
//       />
//     </div>

//     {/* DOMAIN */}
//     <div className="space-y-2">
//       <select
//         value={domain}
//         onChange={(e) => setDomain(e.target.value)}
//         className="select select-bordered w-full"
//       >
//         <option value="">Select Domain</option>
//         {domains.map((d) => (
//           <option key={d}>{d}</option>
//         ))}
//       </select>

//       {domain === "Other" && (
//         <input
//           value={customDomain}
//           onChange={(e) => setCustomDomain(e.target.value)}
//           className="input input-bordered w-full"
//           placeholder="Enter Custom Domain"
//         />
//       )}
//     </div>

//     {/* DESCRIPTION */}
//     <textarea
//       value={description}
//       onChange={(e) => setDescription(e.target.value)}
//       className="textarea textarea-bordered w-full"
//       placeholder="Project Description"
//     />

//     {/* PARTICIPANTS */}
//     <div>
//       <h4 className="font-semibold mb-3">Participants</h4>

//       {/* EXISTING */}
//       <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
//         {participants.map((p) => {
//           const user = orgUsers.find((u) => u._id === p.user);

//           return (
//             <div
//               key={p.user}
//               className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2"
//             >
//               <div className="text-sm">
//                 <p className="font-medium">
//                   {user?.name || "Unknown"}
//                 </p>
//                 <p className="text-xs text-base-content/60">
//                   {p.role} • {p.responsibility}
//                 </p>
//               </div>

//               <button
//                 className="btn btn-xs btn-error"
//                 onClick={() => removeParticipant(p.user)}
//               >
//                 Remove
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* ADD NEW */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
//         <select
//           value={newParticipant.user}
//           onChange={(e) =>
//             setNewParticipant({ ...newParticipant, user: e.target.value })
//           }
//           className="select select-bordered w-full"
//         >
//           <option value="">User</option>
//           {orgUsers.map((u) => (
//             <option key={u._id} value={u._id}>
//               {u.name}
//             </option>
//           ))}
//         </select>

//         <select
//           value={newParticipant.role}
//           onChange={(e) =>
//             setNewParticipant({ ...newParticipant, role: e.target.value })
//           }
//           className="select select-bordered w-full"
//         >
//           <option value="">Role</option>
//           {roles.map((r) => (
//             <option key={r}>{r}</option>
//           ))}
//         </select>

//         <select
//           value={newParticipant.responsibility}
//           onChange={(e) =>
//             setNewParticipant({
//               ...newParticipant,
//               responsibility: e.target.value,
//             })
//           }
//           className="select select-bordered w-full"
//         >
//           <option value="">Responsibility</option>
//           {responsibilities.map((r) => (
//             <option key={r}>{r}</option>
//           ))}
//         </select>

//         <button
//           className="btn btn-primary"
//           onClick={addParticipant}
//         >
//           + Add
//         </button>
//       </div>
//     </div>

//     {/* ACTIONS */}
//     <div className="flex justify-end gap-3 pt-4 border-t">
//       <button className="btn btn-ghost" onClick={onClose}>
//         Cancel
//       </button>

//       <button
//         className="btn btn-primary"
//         onClick={() =>
//           onSave({
//             ...project,
//             name,
//             status,
//             startDate,
//             endDate,
//             domain,
//             customDomain,
//             description,
//             participants,
//           })
//         }
//       >
//         Save Changes
//       </button>
//     </div>
//   </div>
// </div>
//   );
// }

import { useState, useEffect } from "react";
import type { Project, Participant } from "../../type/project";
import { useAuth } from "@/auth/AuthContext";
import API from "@/api/axios";
import { getMembers } from "@/services/memberService";

interface Props {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Project) => void;
}

interface OrgUser {
  _id: string;
  name: string;
  role: string;
}

const roles = ["Member", "Manager"];

const responsibilities = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Debugging",
  "Content",
  "Research",
  "Maintain",
  "UI Design",
  "Testing",
  "Deployment",
];

const domains = [
  "Web Development",
  "App Development",
  "AI/ML",
  "Social Media",
  "Block Chain",
  "Content Creation",
  "Content Writing",
  "Testing",
  "Software Development",
  "Other",
];

export default function EditProjectModal({
  project,
  open,
  onClose,
  onSave,
}: Props) {
  const { auth } = useAuth();

  const [name, setName] = useState("");
  const [status, setStatus] = useState<Project["status"]>("Active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);

  const [newParticipant, setNewParticipant] = useState<Participant>({
    user: "",
    role: "",
    responsibility: "",
  });

  useEffect(() => {
    if (!project) return;

    setName(project.name || "");
    setStatus(project.status || "Active");
    setStartDate(project.startDate || "");
    setEndDate(project.endDate || "");
    setDomain(project.domain || "");
    setCustomDomain(project.customDomain || "");
    setDescription(project.description || "");

    setParticipants(
      (project.participants || []).map((p) => ({
        ...p,
        user: typeof p.user === "object" ? p.user._id : p.user,
      })),
    );
  }, [project]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getMembers(auth.slug);
        API.get(`/${auth.slug}/getMembers`);
        setOrgUsers(res.data.members || res.data.users || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMembers();
  }, [auth.slug]);

  if (!open || !project) return null;

  const formatDate = (d?: string | Date) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const addParticipant = () => {
    if (
      !newParticipant.user ||
      !newParticipant.role ||
      !newParticipant.responsibility
    )
      return;

    const alreadyExists = participants.some(
      (p) => p.user === newParticipant.user,
    );

    if (alreadyExists) return;

    setParticipants([
      ...participants,
      {
        ...newParticipant,
        user: newParticipant.user,
      },
    ]);

    setNewParticipant({
      user: "",
      role: "",
      responsibility: "",
    });
  };

  const removeParticipant = (userId: string) => {
    setParticipants(participants.filter((p) => p.user !== userId));
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 ">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div
        className="
          relative bg-base-200 text-base-content
          rounded-2xl shadow-xl
          w-[95%] sm:w-full max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          p-4 sm:p-6
          space-y-5 sm:space-y-6
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-primary/20 pb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-primary">
            Edit Project
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            ✕
          </button>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 rounded-sm text-sm
        bg-base-100 border border-base-300
         focus:outline-none
         focus:ring-2 focus:ring-primary/40
        placeholder:text-base-content/40border-primary-content w-full"
            placeholder="Project Name"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project["status"])}
            className="
    select w-full text-sm
    bg-base-100 border border-base-300
    focus:outline-none focus:ring-2 focus:ring-primary/40

    
    focus:shadow-none
    outline-none
  
  "
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="date"
            value={formatDate(startDate)}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 rounded-sm text-sm
        bg-base-100 border border-base-300
         focus:outline-none
         focus:ring-2 focus:ring-primary/40
        placeholder:text-base-content/40 w-full  focus-visible:outline-none"
          />

          <input
            type="date"
            value={formatDate(endDate)}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 rounded-sm text-sm
        bg-base-100 border border-base-300
         focus:outline-none
         focus:ring-2 focus:ring-primary/40
        placeholder:text-base-content/40 w-full"
          />
        </div>

        {/* DOMAIN */}
        <div className="space-y-2">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className=" select w-full text-sm
    bg-base-100 border border-base-300
    focus:outline-none focus:ring-2 focus:ring-primary/40

    
    focus:shadow-none
    outline-none  "
          >
            <option value="">Select Domain</option>
            {domains.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          {domain === "Other" && (
            <input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="px-4 py-2 rounded-sm text-sm
        bg-base-100 border border-base-300
         focus:outline-none
         focus:ring-2 focus:ring-primary/40
        placeholder:text-base-content/40 w-full"
              placeholder="Enter Custom Domain"
            />
          )}
        </div>

        {/* DESCRIPTION */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm
        bg-base-100 border border-base-300
         focus:outline-none
         focus:ring-2 focus:ring-primary/40
        placeholder:text-base-content/40 w-full"
          placeholder="Project Description"
        />

        {/* PARTICIPANTS */}
        <div>
          <h4 className="font-semibold mb-3">Participants</h4>

          {/* LIST */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {participants.map((p) => {
              const user = orgUsers.find((u) => u._id === p.user);

              return (
                <div
                  key={p.user}
                  className="flex items-center justify-between bg-base-300 rounded-lg px-3 py-2"
                >
                  <div className="text-sm">
                    <p className="font-medium">{user?.name || "Unknown"}</p>
                    <p className="text-xs text-base-content/60">
                      {p.role} • {p.responsibility}
                    </p>
                  </div>

                  <button
                    className="btn btn-xs btn-error text-secondary-content"
                    onClick={() => removeParticipant(p.user)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* ADD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <select
              value={newParticipant.user}
              onChange={(e) =>
                setNewParticipant({
                  ...newParticipant,
                  user: e.target.value,
                })
              }
              className="  select w-full text-sm
    bg-base-100 border border-base-300
    focus:outline-none focus:ring-2 focus:ring-primary/40

    focus:shadow-none
    outline-none"
            >
              <option value="">User</option>
              {orgUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={newParticipant.role}
              onChange={(e) =>
                setNewParticipant({
                  ...newParticipant,
                  role: e.target.value,
                })
              }
              className=" select w-full text-sm
    bg-base-100 border border-base-300
    focus:outline-none focus:ring-2 focus:ring-primary/40

    
    focus:shadow-none
    outline-none"
            >
              <option value="">Role</option>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <select
              value={newParticipant.responsibility}
              onChange={(e) =>
                setNewParticipant({
                  ...newParticipant,
                  responsibility: e.target.value,
                })
              }
              className=" select w-full text-sm
    bg-base-100 border border-base-300
    focus:outline-none focus:ring-2 focus:ring-primary/40

    
    focus:shadow-none
    outline-none"
            >
              <option value="">Responsibility</option>
              {responsibilities.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={addParticipant}>
              + Add
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
          <button className="btn btn-ghost w-full sm:w-auto" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() =>
              onSave({
                ...project,
                name,
                status,
                startDate,
                endDate,
                domain,
                customDomain,
                description,
                participants,
              })
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
