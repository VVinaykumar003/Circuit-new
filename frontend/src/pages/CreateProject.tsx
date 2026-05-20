import API from "@/api/axios";
import { useAuth } from "@/auth/AuthContext";
import { AddParticipant } from "@/components/projects/AddParticipant";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { createProject } from "@/services/projectServices";
import { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { toast } from "react-toastify";

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
    <div className="min-h-screen bg-base-100 px-4 py-6 sm:py-10 flex justify-center">
      <div className="w-full max-w-4xl bg-primary/30 backdrop-blur-md border border-base-200 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8">
        {/* ================= HEADING ================= */}
        <div className="mb-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-content">
            Create New Project
          </h1>
          <p className="text-md font-medium text-base-content/80 mt-2">
            Fill in project details and assign team members
          </p>
        </div>

        {/* ================= TABS ================= */}
        {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 mb-6 sm:mb-8 bg-base-200 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-base-100 shadow text-base-content"
                  : "text-base-content/60 hover:text-base-content"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div> */}

        <div className="mb-6 sm:mb-8">
          <div className="flex bg-primary/20 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`
          flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300
          ${
            activeTab === tab
              ? "bg-primary shadow text-primary-content"
              : "text-base-content/80 hover:text-base-content"
          }
        `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === "Project Info" && (
            <CreateProjectForm
              onNext={() => setActiveTab("Participants")}
              projectData={projectData}
              setProjectData={setProjectData}
            />
          )}

          {activeTab === "Participants" && (
            <AddParticipant
              participants={participants}
              setParticipants={setParticipants}
              onCreate={handleCreateProject}
              creating={creating}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
