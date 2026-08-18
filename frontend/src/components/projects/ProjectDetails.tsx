// import StatusBadge from "../ui/StatusBadge";
// import type { Project } from "../../type/project";
// import { useState } from "react";
// import EditProjectModal from "./EditProjectModal";

// interface Props {
//   project: Project;
//   onClose: () => void;
// }

// export default function ProjectDetails({ project, onClose }: Props) {
//   const [editProject, setEditProject] = useState<Project | null>(null);

//   return (
//     <div className="space-y-6 text-base-content">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <h2 className="text-lg font-semibold">
//           {project.name}
//         </h2>

//         <button
//           className="btn btn-sm btn-ghost"
//           onClick={onClose}
//         >
//           ✕
//         </button>
//       </div>

//       <StatusBadge
//         status={
//           project.status === "active"
//             ? "approved"
//             : project.status === "completed"
//             ? "approved"
//             : "pending"
//         }
//       />

//       {/* Info */}
//       <div className="space-y-3 text-sm">
//         <div>
//           <span className="text-base-content/60">Manager</span>
//           <p className="font-medium">{project.manager}</p>
//         </div>

//         <div>
//           <span className="text-base-content/60">Due Date</span>
//           <p>{project.dueDate}</p>
//         </div>

//         <div>
//           <span className="text-base-content/60">Team</span>
//           <p>{project.teamCount} members</p>
//         </div>
//       </div>

//       {/* Progress */}
//       <div>
//         <div className="flex justify-between text-xs mb-1">
//           <span>Progress</span>
//           <span>{project.progress}%</span>
//         </div>
//         <progress
//           className="progress progress-primary w-full"
//           value={project.progress}
//           max={100}
//         />
//       </div>

//       {/* Actions */}
//       <div className="flex  justify-center gap-2 pt-4">
//         <button
//         className="btn btn-outline btn-sm w-1/2"
//         onClick={() => setEditProject(project)}
//       >
//         Edit Project
//       </button>

//         <button className="btn btn-error btn-sm w-1/2">
//           Archive
//         </button>
//       </div>

//       <EditProjectModal
//   open={!!editProject}
//   project={editProject!}
//   onClose={() => setEditProject(null)}
//   onSave={(updated) => {
//     // optimistic update here
//     setEditProject(null);
//   }}
// />

//     </div>
//   );
// }


// ProjectDetails.tsx

import StatusBadge from "../ui/StatusBadge";
import type { Project, Participant } from "../../type/project";
import { useState } from "react";
import EditProjectModal from "./EditProjectModal";
import { useAuth } from "@/auth/AuthContext";
import { updateProject } from "@/services/projectServices";

interface Props {
  project: Project;
  onClose: () => void;
  onUpdate: (updated: Project) => void; // parent page refresh
}

export default function ProjectDetails({ project, onClose, onUpdate }: Props) {
  const [editProject, setEditProject] = useState<Project | null>(null);
  const { auth } = useAuth();
  const handleSave = async (updated: Project) => {
  
    try {
      const payload = {
        projectName: updated.name,
        projectState: updated.status,
        startDate: updated.startDate,
        endDate: updated.endDate,
        domain: updated.domain,
        customDomain: updated.customDomain,
        description: updated.description,
        participants: updated.participants,
      };

      await updateProject(auth.slug, updated.id, payload);

      setEditProject(null);
      onUpdate(updated); // update parent list optimistically
      onClose();
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  return (
    <div className="space-y-6 text-base-content">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">{project.name}</h2>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
      </div>

      <StatusBadge
        status={
          project.status === "Active" || project.status === "Completed"
            ? "approved"
            : "pending"
        }
      />

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-base-content/60">Manager</span>
          <p className="font-medium">{project.manager}</p>
        </div>
        <div>
          <span className="text-base-content/60">Due Date</span>
          <p>{project.dueDate}</p>
        </div>
        <div>
          <span className="text-base-content/60">Team</span>
          <p>{project.teamCount} members</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <progress className="progress progress-primary w-full" value={project.progress} max={100} />
      </div>

      <div className="flex justify-center gap-2 pt-4">
        <button className="btn btn-outline btn-sm w-1/2" onClick={() => setEditProject(project)}>Edit Project</button>
        <button className="btn btn-error btn-sm w-1/2">Archive</button>
      </div>

      <EditProjectModal
        open={!!editProject}
        project={editProject!}
        onClose={() => setEditProject(null)}
        onSave={handleSave}
      />
    </div>
  );
}