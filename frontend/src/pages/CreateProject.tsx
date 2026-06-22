import API from "@/api/axios";
import { useAuth } from "@/auth/AuthContext";
import { AddParticipant } from "@/components/projects/AddParticipant";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { createProject } from "@/services/projectServices";
import { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { toast } from "react-toastify";
import { MdOutlineWorkspaces, MdInfoOutline, MdPeopleAlt } from "react-icons/md";
import { FaCalendarAlt, FaTag } from "react-icons/fa";

const TABS = ["Project Info", "Participants"];
export interface ProjectData {
  projectName: string;
  projectState: string;
  startDate: string;
  endDate: string;
  domain: string;
  customDomain?: string;
  description: string;
}
interface Participant {
  userId: string;
  role: string;
  responsibility: string;
}

const initialProjectState: ProjectData = {
  projectName: "",
  projectState: "Active",
  startDate: "",
  endDate: "",
  domain: "",
  customDomain: "",
  description: "",
};

const CreateProject = () => {
  const [activeTab, setActiveTab] = useState("Project Info");
  const [projectData, setProjectData] =
    useState<ProjectData>(initialProjectState);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [creating, setCreating] = useState(false);

  const handleTabClick = (tab: string) => {
    if (tab === "Participants") {
      if (!projectData.projectName.trim() || !projectData.domain.trim()) {
        toast.error("Please fill project info first");
        return;
      }
    }
    setActiveTab(tab);
  };

  

  //   try {
  //     setCreating(true);
  //     const finalDomain =
  //       projectData.domain === "other"
  //         ? projectData.customDomain
  //         : projectData.domain;
  //     const { customDomain, ...rest } = projectData;
  //     const finalPayload = {
  //       ...rest,
  //       domain: finalDomain,
  //       participants,
  //     };

  //     console.log("FINAL DATA:", finalPayload);

    

  //     setProjectData(initialProjectState);
  //     setParticipants([]);
  //     setActiveTab("Project Info");

  //     toast.success("Project created successfully 🎉");
  //   } catch (error) {
  //     console.error("Project creation failed", error);
  //   } finally {
  //     setCreating(false);
  //   }
  // };
 // make sure this is your axios instance or fetch wrapper
 const { auth } = useAuth(); // get auth context for slug and token
 const slug = auth.slug;
const handleCreateProject = async () => {
  
  if (participants.length === 0) {
    toast.error("Add at least one participant");
    return;
  }

  try {
    setCreating(true);

    // Handle domain
    const finalDomain =
      projectData.domain.toLowerCase() === "other"
        ? projectData.customDomain
        : projectData.domain;

   const payload = {
  ...projectData,
  domain: projectData.domain, // ❗ override mat karo
  customDomain:
    projectData.domain === "Other"
      ? projectData.customDomain
      : "",
  participants: participants?.map((p) => ({
    user: p.userId,
    role: p.role,
    responsibility: p.responsibility,
  })),
};

    // Send POST request to backend
    const res = await createProject(slug, payload)

    if (res.data.success) {
      toast.success("Project created successfully ");
      // Reset form
      setProjectData(initialProjectState);
      setParticipants([]);
      setActiveTab("Project Info");
    } else {
      toast.error(res.data.message || "Failed to create project");
    }
  } catch (error: any) {
    console.error("Project creation failed", error);
    toast.error(error?.response?.data?.message || "Server error");
  } finally {
    setCreating(false);
  }
};
  
  


  return (
    <div className="min-h-screen bg-base-200/40 py-6 px-4 sm:px-6 lg:px-8">
      {/* Loading Overlay */}
      {creating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100/80 backdrop-blur-sm transition-all">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <h2 className="text-xl font-semibold text-base-content">Creating Project...</h2>
          <p className="text-base-content/60 mt-1">Please wait while we set up your workspace and participants.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <Breadcrumbs />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm border border-primary/20 hidden sm:block">
              <MdOutlineWorkspaces size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">Create New Project</h1>
              <p className="text-base-content/60 text-sm sm:text-base mt-1">Configure project details, assign members, and set tracking parameters.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Column: Form & Steps */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Progress Steps Card */}
            <div className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body p-4 sm:p-6 overflow-x-auto">
                <ul className="steps w-full min-w-[300px]">
                  <li 
                    onClick={() => handleTabClick("Project Info")}
                    className={`step cursor-pointer ${activeTab === "Project Info" || activeTab === "Participants" ? "step-primary text-primary" : "text-base-content/50"}`}
                  >
                    <span className="text-sm font-medium mt-2">Project Information</span>
                  </li>
                  <li 
                    onClick={() => handleTabClick("Participants")}
                    className={`step cursor-pointer ${activeTab === "Participants" ? "step-primary text-primary" : "text-base-content/50"}`}
                  >
                    <span className="text-sm font-medium mt-2">Team Participants</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="card bg-base-100 border border-base-200 shadow-sm min-h-[400px]">
              <div className="card-body p-0 sm:p-2">
                <div className="p-4 sm:p-6 transition-all duration-300">
                  {activeTab === "Project Info" && (
                    <div className="animate-fade-in duration-300">
                      <CreateProjectForm
                        onNext={() => setActiveTab("Participants")}
                        projectData={projectData}
                        setProjectData={setProjectData}
                      />
                    </div>
                  )}

                  {activeTab === "Participants" && (
                    <div className="animate-fade-in duration-300">
                      <AddParticipant
                        participants={participants}
                        setParticipants={setParticipants}
                        onCreate={handleCreateProject}
                        creating={creating}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Project Summary Sidebar */}
          <div className="w-full lg:w-80 shrink-0 sticky top-6">
            <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="card-body p-5">
                <h3 className="font-bold text-lg text-base-content border-b border-base-200 pb-3 mb-3 flex items-center gap-2">
                  <MdInfoOutline className="text-primary" size={20} />
                  Project Summary
                </h3>

                <div className="space-y-4">
                  {/* Project Name */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Project Name</span>
                    <span className="text-sm font-medium text-base-content break-words">
                      {projectData.projectName || <span className="text-base-content/30 italic">Not set</span>}
                    </span>
                  </div>

                  {/* Domain */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Domain</span>
                    <span className="text-sm font-medium text-base-content flex items-center gap-1.5">
                      <FaTag className="text-base-content/40" size={12} />
                      {projectData.domain === "Other" ? (projectData.customDomain || "Other") : (projectData.domain || <span className="text-base-content/30 italic">Not set</span>)}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Start Date</span>
                      <span className="text-sm font-medium text-base-content flex items-center gap-1.5">
                        <FaCalendarAlt className="text-base-content/40" size={12} />
                        {projectData.startDate || "--/--/----"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">End Date</span>
                      <span className="text-sm font-medium text-base-content flex items-center gap-1.5">
                        <FaCalendarAlt className="text-base-content/40" size={12} />
                        {projectData.endDate || "--/--/----"}
                      </span>
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Team Size</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg">
                        <MdPeopleAlt size={16} />
                      </div>
                      <span className="text-sm font-bold text-base-content">
                        {participants.length} Participant{participants.length !== 1 && "s"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">Status</span>
                    <div className="mt-1">
                      <span className={`badge badge-sm font-medium ${projectData.projectState === 'Active' ? 'badge-success' : 'badge-ghost'}`}>
                        {projectData.projectState || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips / Help Card (Desktop Only) */}
            <div className="card bg-info/5 border border-info/20 shadow-sm mt-4 hidden lg:flex">
              <div className="card-body p-4 text-sm text-info-content/80">
                <div className="flex items-start gap-2">
                  <MdInfoOutline size={18} className="text-info shrink-0 mt-0.5" />
                  <p>Assign clear roles and responsibilities to your team to ensure a smooth project workflow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
