// import { useState } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../type/project";

// interface Props {
//   projects: Project[];
//   onOpen?: (project: Project) => void; // optional
// }

// export default function ProjectGrid({ projects, onOpen }: Props) {
//   const [role] = useState<"admin" | "user">("admin"); // later from auth
//   const [projectsState, setProjectsState] =
//     useState<Project[]>(projects);

//   return (
//     <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//       {projectsState.map((project) => (
//         <ProjectCard
//           key={project.id}
//           project={project}
//           onOpen={() => onOpen?.(project)} // 🔑 delegate
//           onDelete={(id) =>
//             setProjectsState((prev) =>
//               prev.filter((p) => p.id !== id)
//             )
//           }
//           canDelete={role === "admin"}
//         />
//       ))}
//     </div>
//   );
// }
interface Props {
  projects: Project[];
  onOpen?: (project: Project) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  canEdit?: boolean;
    onUpdate: (updated: Project) => void;
    gridClassName?: string;
}

export default function ProjectGrid({
  projects,
  onOpen,
  onDelete,
  onUpdate,
  canEdit,
  canDelete,
  gridClassName,
}: Props) {

  return (
  //  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 justify-items-center">
  <div  className={
    gridClassName ||
    "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
  }>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          canEdit={canEdit}
          onOpen={() => onOpen?.(project)}
          onDelete={onDelete}
          canDelete={canDelete}
          onUpdate={onUpdate}
          
        />
      ))}
    </div>
  );
}
