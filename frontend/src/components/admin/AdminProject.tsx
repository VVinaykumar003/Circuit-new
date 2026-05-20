

import { Calendar } from "lucide-react";
import React from "react";

interface Project {
  id: string;
  name: string;
  status: "active" | "completed" | "on-hold";
  dueDate: string;
}

interface AdminProjectProps {
  project: Project;
}

const statusColor = {
  active: "text-emerald-400",
  completed: "text-blue-400",
  "on-hold": "text-amber-400",
};

const AdminProject: React.FC<AdminProjectProps> = ({ project }) => {
  return (
    <div className="bg-base-200 border border-base-300  rounded-xl p-4  hover:shadow-md transition-all duration-200  w-52 m-3">
      
      {/* Project Name */}
      <div className=" flex justify-between">
      <h3 className="text-sm font-semibold  mb-2 truncate">
        {project.name}
      </h3>
        <span className={`text-xs font-medium ${statusColor[project.status]}`}>
        {project.status}
      </span>
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
        <Calendar size={14} />
        <span>{project.dueDate}</span>
      </div>

      
    
    </div>
  );
};

export default AdminProject;
