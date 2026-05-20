import { useState } from "react";
import type { Project } from "../../type/project";

import Tabs from "../ui/Tabs";
import AdminProject from "./AdminProject";
import AdminPasswordReset from "./AdminPasswordReset";


type Filter = "all" | "active" | "completed" | "on-hold";
type AdminTab = "projects" | "settings";

const adminTabs: { key: AdminTab; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "settings", label: "Settings" },
];
type AdminProjectType = Pick<Project, "id" | "name" | "status" | "dueDate" >;


export default function AdminRightSection({ adminId }: { adminId: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  

  // TEMP PROJECT DATA (later API se aayega)
  const projects:AdminProjectType[] = [
    {
      id: "p1",
      name: "ERP System",
      
      status: "completed",
      dueDate:"12-12-2025"
    },
    {
      id: "p2",
      name: "HR Dashboard",
      
      status: "completed",
      dueDate:"11-1-2026"
    },
  ];

 

  return (
    <div className="flex-1">
      <Tabs<AdminTab>
        value={activeTab}
        onChange={setActiveTab}
        tabs={adminTabs}
      />

      {/* PROJECTS TAB */}
      {activeTab === "projects" && (
        <div className="flex gap-1">
    {projects.map((project) => (
     
      <AdminProject key={project.id} project={project} />
    
    ))}
  </div>
      )}

     

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
       <AdminPasswordReset id={adminId}/>
      )}
    </div>
  );
}
