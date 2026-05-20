import StatusBadge from "../ui/StatusBadge";
import type { Project } from "../../type/project";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaTrash } from "react-icons/fa";
import { MdChat, MdFileOpen } from "react-icons/md";
import Swal from "sweetalert2";
import { useState } from "react";
import EditProjectModal from "./EditProjectModal";
import { updateProject } from "@/services/projectServices";
import { useAuth } from "@/auth/AuthContext";
import { Edit2 } from "lucide-react";

interface Props {
  project: Project;
  onOpen: () => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  canEdit?: boolean;
  onUpdate?: (updated: Project) => void;
}

export default function ProjectCard({
  project,
  onUpdate,
  onDelete,
  canEdit,
  canDelete = true,
}: Props) {
  const navigate = useNavigate();
  console.log("ProjectCard render", canEdit);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const { auth } = useAuth();
  //  const handleSave = async (updated: Project) => {

  //     try {
  //       const payload = {
  //         projectName: updated.name,
  //         projectState: updated.status,
  //         startDate: updated.startDate,
  //         endDate: updated.endDate,
  //         domain: updated.domain,
  //         customDomain: updated.customDomain,
  //         description: updated.description,
  //         participants: updated.participants,
  //       };

  //       await updateProject(auth.slug, updated.id, payload);

  //       setEditProject(null);
  //       onUpdate?.(updated); // update parent list optimistically

  //     } catch (err) {
  //       console.error("Failed to update project", err);
  //     }
  //   };

  console.log("Rendering ProjectCard:", project);
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
      console.log(payload);
      // 🔥 IMPORTANT: remap for UI
      const mappedUpdated = {
        ...updated,
        manager:
          updated.participants?.find((p: any) => p.role === "Manager")?.user
            ?.name || "N/A",
        teamCount: updated.participants?.length || 0,
        dueDate: updated.endDate
          ? new Date(updated.endDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "No deadline",
      };

      setEditProject(null);
      onUpdate?.(mappedUpdated); // 👈 use mapped data
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  return (
    <div   onClick={() => navigate(`/projects/${project.id}`)} className="group bg-base-200 text-primary border border-primary shadow-sm rounded-xl p-2 sm:p-5 space-y-4 hover:shadow-lg transition relative w-full  h-full flex flex-col justify-between  min-w-0 max-w-full cursor-pointer">
      {/* HEADER */}
      <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
        <h3 className="font-bold  text-lg leading-snug line-clamp-2 break-words flex-1 min-w-0 ">
          {project.name}
        </h3>
       
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge
            status={
              project.status === "Active" || project.status === "Completed"
                ? "approved"
                : "pending"
            }
          />
       
         <div className="flex items-center ">
          {canDelete && onDelete && (
            <div className="lg:tooltip" data-tip="Delete project">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Swal.fire({
                    title: "Are you sure?",
                    text: `Delete project "${project.name}"?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Yes, delete it!",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      onDelete(project.id);
                    }
                  });
                }}
                className="btn btn-xs btn-ghost text-error hover:bg-error/10"
                title="Delete project"
              >
                <FaTrash className="w-3 h-4" />
              </button>

            </div>
          )}

          {canEdit && (
            <div className="tooltip tooltip-top" data-tip="Edit project">
              <button
                className="btn-xs btn-ghost btn text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditProject(project);
                }}
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* MANAGER */}
      <p className="text-sm font-medium text-primary/70 mb-4">
        Manager: <span className="font-medium">{project.manager}</span>
      </p>

      {/* PROGRESS */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-primary/60 mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <progress
          className="progress progress-primary w-full h-3 rounded-lg"
          value={project.progress}
          max={100}
        />
      </div>

      
     {/* META */}
<div className="mt-4 flex  justify-between items-center gap-4 text-xs text-primary/70 flex-wrap">
  
  {/* Left Meta Info */}
  <div className="flex items-center gap-4 whitespace-nowrap flex-wrap">
    <span className="flex text-sm font-medium items-center gap-1">
      <FaUser /> {project.teamCount}
    </span>

    <span className="flex text-sm font-medium items-center gap-1">
      <FaCalendarAlt size={14} /> {project.dueDate}
    </span>
  </div>

  {/* Right Action Buttons */}
  <div className="flex items-center gap-1">

  {/* VIEW */}
  {/* <div className="tooltip tooltip-top" data-tip="View project">
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="
        p-2 rounded-lg
        text-base-content/60
        hover:text-primary
        hover:bg-primary/10
        transition-all duration-200
      "
    >
      <MdFileOpen size={20} />
    </button>
  </div> */}

  {/* CHAT */}
<div className="" data-tip="Open chat">
  <button
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/projects/${project.id}?tab=chat`);
    }}
   className="
  shrink-0
  inline-flex items-center gap-2
  px-3 py-2
  rounded-lg
  bg-primary/80
  text-primary-content
  border border-primary/20
  hover:bg-primary
  transition-all duration-200
  font-medium
"
  >
    <MdChat size={18} />
    <span >Chat</span>
  </button>
</div>
</div>
</div>
      <EditProjectModal
        open={!!editProject}
        project={editProject!}
        onClose={() => setEditProject(null)}
        onSave={(updated) => {
          handleSave(updated);
        }}
      />
    </div>
  );
}
