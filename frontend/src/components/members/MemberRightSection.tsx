import { useState, useEffect } from "react";

import ProjectGrid from "../projects/ProjectGrid";
import ProjectFilters from "../projects/ProjectFilters";
import type { Project } from "../../type/project";
import ProjectDrawer from "../projects/ProjectDrawer";
import ProjectDetails from "../projects/ProjectDetails";
import MemberTask from "./MemberTask";
import Tabs from "../ui/Tabs";
import { useAuth } from "@/auth/AuthContext";
import { getProject } from "@/services/projectServices";
import { useNavigate } from "react-router-dom";


type Filter = "all" | "active" | "completed" | "on-hold";
type RightTab = "projects" | "tasks";

const memberTabs: { key: RightTab; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
];

export default function MemberRightSection({ memberId }: { memberId: string }) {
  const { auth } = useAuth();
  const slug = auth?.slug;

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<RightTab>("projects");
  const [filter, setFilter] = useState<Filter>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  useEffect(() => {
    const fetchMemberProjects = async () => {
      if (!slug || !memberId) return;
      try {
        setLoading(true);
        const res = await getProject(slug);
        const allProjects = res.data?.projects || [];
        
        // Filter projects to only include those where this member is a participant
        const memberProjects = allProjects.filter((p: any) => 
          p.participants?.some((part: any) => 
            (part.user?._id || part.user) === memberId
          )
        );

        // Map them to the standardized frontend object format
        const mappedProjects = memberProjects.map((p: any) => ({
          ...p,
          id: p._id,
          name: p.projectName || "Untitled Project",
          status: p.projectState || "active",
          progress: 0,
          manager: p.participants?.find((part: any) => part.role === "Manager")?.user?.name || "N/A",
          teamCount: p.participants?.length || 0,
          dueDate: p.endDate
            ? new Date(p.endDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "No deadline",
        }));

        setProjects(mappedProjects);
      } catch (error) {
        console.error("Failed to fetch member projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberProjects();
  }, [slug, memberId]);

  //  FILTER LOGIC
  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter(
          (p) => p.status?.toLowerCase() === filter.toLowerCase()
        );

  return (
<div className="flex-1 w-full px-3 sm:px-4 lg:px-1 ">
   
      <Tabs<RightTab>
        value={activeTab}
        onChange={setActiveTab}
        tabs={memberTabs}
       
      />

      {activeTab === "projects" && (
        <>
          {/* ✅ PROJECT FILTERS */}
          <ProjectFilters
            value={filter}
            onChange={setFilter}
          />

          {loading ? (
            <div className="flex justify-center p-8">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center p-8 text-base-content/60">
              No {filter === "all" ? "" : filter} projects found for this member.
            </div>
          ) : (
            <ProjectGrid
              onOpen={(project) => setSelectedProject(project)}
              projects={filteredProjects}
              canDelete
              gridClassName="
    grid
    grid-cols-1
    xl:grid-cols-2
    gap-5
  "
            />
          )}
        </>
      )}
      <ProjectDrawer
              open={!!selectedProject}
              onClose={() => setSelectedProject(null)}
            >
              {selectedProject && (
                <ProjectDetails
                  project={selectedProject}
                  onClose={() => setSelectedProject(null)}
                />
              )}
            </ProjectDrawer>

      {activeTab === "tasks" && (
        <div className="bg-base-200 border border-base-300 rounded-xl p-6 text-sm text-base-content/60">
         <MemberTask  memberId={memberId}/>
        </div>
      )}
    </div>
  );
}
