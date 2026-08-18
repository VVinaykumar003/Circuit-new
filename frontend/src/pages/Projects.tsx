import EmptyState from "../components/ui/EmptyState";
import ProjectGrid from "../components/projects/ProjectGrid";
import type { Project, ProjectFilter } from "../type/project";
import { useEffect, useState } from "react";
import ProjectDrawer from "../components/projects/ProjectDrawer";
import ProjectDetails from "../components/projects/ProjectDetails";
import ProjectGridSkeleton from "@/components/projects/ProjectGridSkeleton";
import ProjectFilters from "@/components/projects/ProjectFilters";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getProject, deleteProject } from "@/services/projectServices";
// import { getOrganizationSlug } from "@/utils/auth";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Pagination from "@/components/ui/Pagination";

export default function Projects() {
  const { auth } = useAuth();
  const slug = auth.slug;
  // console.log("Auth in Projects:", auth);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Helper to check roles
  const hasRole = (roles: string[]) => auth.user?.role ? roles.includes(auth.user?.role) : false;

  const canDelete = hasRole(["admin", "owner", "manager"]);
  const canEdit = hasRole(["admin", "owner"]);
 

// ------------------Delete Project------------------




  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
       
        const res = await getProject(slug);
        // console.log(res)
        // api.get(`/projects/${auth.slug}/getProjects`, {
        //   params: filter !== "all" ? { projectState: filter } : {},
        // });
        const mappedProjects = (res.data?.projects || []).map((p: any) => ({
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
        }
        ));

        setProjects(mappedProjects);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleDeleteProject = async (id: string) => {
  try {
    await deleteProject(slug, id);

    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast .success("Project deleted");
    setSelectedProject(null);
  } catch (error) {
    console.error("Delete failed", error);
  }
};


  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status?.toLowerCase() === filter.toLowerCase());

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(page, totalPages);
  const paginatedProjects = filteredProjects.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Breadcrumbs />

      {/* Project Filters */}
      <ProjectFilters value={filter} onChange={setFilter} />

      {/* Projects Grid */}
      {loading ? (
        <ProjectGridSkeleton />
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-base-100 border border-base-300 rounded-xl text-center">
          <EmptyState
            title={`No ${filter === "all" ? "" : filter} projects`}
            description="Try switching filters or create a new project to get started."
          />
          {canEdit && (
            <Link to="/createProject" className="btn btn-primary mt-6">
              + Get Started
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <ProjectGrid
            projects={paginatedProjects}
            onOpen={(project) => setSelectedProject(project)}
            onDelete={canDelete ? handleDeleteProject : undefined}
            canEdit={canEdit}
            onUpdate={(updated) => {
             setProjects((prev) => 
               prev.map((p) => (p.id === updated.id ? updated : p))
             );
           }}
          />
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Project Details Drawer */}
      <ProjectDrawer
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <ProjectDetails
           onUpdate={(updated) => {
             setProjects((prev) => 
               prev.map((p) => (p.id === updated.id ? updated : p))
             );
           }}
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </ProjectDrawer>
    </div>
  );
}
