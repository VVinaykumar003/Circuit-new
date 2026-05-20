import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import {
  ClipboardList,
  CheckCircle2,
  LoaderCircle,
  Clock3,
  AlertTriangle,
} from "lucide-react";
// tab components
import ProjectTasks from "../components/projects/ProjectTasks";
import ProjectMembers from "../components/projects/ProjectMembers";
import ProjectActivity from "../components/projects/ProjectActivity";
import ProjectChat from "@/components/projects/ProjectChat";

import { useAuth } from "@/auth/AuthContext";
import { getProjectById } from "@/services/projectService";
import { getTasksByProjectId } from "@/services/taskService"; // renamed service
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import WorkUpdate from "./WorkUpdate";

type ProjectTab = "overview" | "tasks" | "members" | "activity" | "chat" | "workUpdates";

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as ProjectTab | null;
  const [activeTab, setActiveTab] = useState<ProjectTab>(
    tabFromUrl || "overview",
  );

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { auth } = useAuth();
  const slug = auth.slug;

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        const projectData = await getProjectById(id, slug);
        setProject(projectData);

        const taskData = await getTasksByProjectId(id, slug); // fetch all tasks for this project
        setTasks(taskData);
      } catch (err) {
        console.error("ProjectWorkspace Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, slug]);

  if (loading || !project)
    return (
      <PageContainer title="Loading..." subtitle="">
        Loading...
      </PageContainer>
    );

  // ===== Metrics for Overview =====
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "high");

  const today = new Date();
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < today && t.status !== "completed",
  );

  const latestTasks = [...tasks]
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    )
    .slice(0, 3);

  const tabs: { key: ProjectTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks" },
    { key: "members", label: "Members" },
    { key: "activity", label: "Activity" },
    { key: "chat", label: "Chat" },
    {key: "workUpdates", label: "Work Updates" },
  ];
  const manager = project.participants.find((p) => p.role === "Manager");

  const projectRole = project?.participants?.find(
    (p) => p.user._id === auth.user?.userId,
  )?.role;
  console.log("User's role in project:", projectRole);
  console.log("Project Data:", project);

  return (
    
    <PageContainer >
      <div className="mb-4">
        <Breadcrumbs />
      </div>

    <PageContainer
      title={project.projectName}
      subtitle={`Managed by ${manager?.user.name || "Unknown"}`}
    >
      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
  <div className="bg-base-200 p-1 rounded-xl inline-flex gap-1 min-w-max">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.key;

      return (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${
              isActive
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:bg-base-100 hover:text-base-content"
            }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
</div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-6">
            <StatCard label="Total Tasks" color="base-content" value={totalTasks}
            icon={<ClipboardList className="w-4 h-4" />} />
            <StatCard
              label="Completed"
              value={completedTasks}
              color="success"
              borderColor="border-success"
              icon={<CheckCircle2 className="w-4 h-4" />} />
            <StatCard
              label="In Progress"
              value={inProgressTasks}
              color="primary"
              borderColor="border-primary"
              icon={<LoaderCircle className="w-4 h-4" />} />
            <StatCard label="Pending" value={pendingTasks} color="warning" borderColor="border-warning" icon={<Clock3 className="w-4 h-4 " />} />
            <StatCard
              label="High Priority"
              value={highPriorityTasks.length}
              color="error"
              borderColor="border-error"
              icon={<AlertTriangle className="w-4 h-4" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              <DescriptionCard description={project.description} />
              <HighPriorityTasksCard tasks={highPriorityTasks} />
              <LatestTasksCard tasks={latestTasks} />
              {/* <ProgressCard progress={project.progress} /> */}
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {overdueTasks.length > 0 && (
                <OverdueTasksCard tasks={overdueTasks} />
              )}
              <TeamCard team={project.participants || []} />
              {/* <ActivityCard activity={project.activity || []} /> */}
            </div>
          </div>
        </>
      )}

      {activeTab === "tasks" && <ProjectTasks projectId={id!} />}
      {activeTab === "members" && (
        <ProjectMembers 
          project={project} 
          onUpdateProject={(updatedProject) => setProject(updatedProject)} 
        />
      )}
      {activeTab === "activity" && <ProjectActivity projectId={id!} />} 
      {activeTab === "chat" && <ProjectChat projectId={id!} currentUser={auth.user} />}
      
      
      {activeTab === "workUpdates" && <WorkUpdate slug={auth.slug} projectId={id!} />}
    </PageContainer>
    </PageContainer>

  );
}

/* ====== Small Reusable Components ====== */
const StatCard = ({
  label,
  value,
  color,
  borderColor,
  icon,
}: {
  label: string;
  value: number;
  color?: string;
  borderColor?: string;
  icon?: React.ReactNode;
}) => (
  <div
    className={`flex flex-col items-start bg-white/70 border ${borderColor || "border-primary"} rounded-lg p-4 text-center ${color ? `text-${color}` : ""}`}
  >
    <div className="flex justify-between  w-full ">
    <p className="text-sm font-bold ">{label}</p>
    {icon && <div className="bg-primary/50 text-primary-content rounded-lg p-1">{icon}</div>}
    </div>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

const DescriptionCard = ({ description }: { description: string }) => (
  <div className="bg-white/70 border border-primary/30 rounded-lg p-6">
    <h3 className=" text-base-content font-semibold mb-2">Description</h3>
    <p className="text-sm font-medium text-base-content/60">{description}</p>
  </div>
);

const HighPriorityTasksCard = ({ tasks }: { tasks: any[] }) => (
  <div className="bg-white/70 border border-error rounded-lg p-6">
    <h3 className=" text-base-content font-semibold mb-3">High Priority Tasks</h3>
    {tasks.length === 0 ? (
      <p className="text-sm font-medium text-base-content/50">No high priority tasks </p>
    ) : (
      <ul className="space-y-2 text-sm">
        {tasks.slice(0, 3).map((task) => (
          <li key={task.id} className="flex justify-between">
            <span>{task.title}</span>
            <span className="text-error text-xs">High</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const LatestTasksCard = ({ tasks }: { tasks: any[] }) => (
  <div className="bg-white/70 border border-primary/30 rounded-lg p-6">
    <h3 className=" text-base-content font-semibold mb-3">Latest Tasks</h3>
    {tasks.length === 0 ? (
      <p className="text-sm font-medium text-base-content/50">No latest tasks </p>
    ) : (
      <ul className="space-y-2 text-sm">
        {tasks.map((task) => (
          <li key={task.id} className="flex justify-between">
            <span>{task.title}</span>
            <span className="text-base-content/60 text-xs">
              {" "}
              {new Date(task.dueDate || task.due).toLocaleDateString("en-GB")}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// const ProgressCard = ({ progress }: { progress: number }) => (
//   <div className="bg-base-200 border border-base-300 rounded-lg p-6">
//     <div className="flex justify-between text-sm text-base-content mb-2">
//       <span>Progress</span>
//       <span>{progress}%</span>
//     </div>
//     <progress className="progress progress-primary w-full" value={progress} max={100} />
//   </div>
// );

const OverdueTasksCard = ({ tasks }: { tasks: any[] }) => (
  <div className="bg-error/5 border border-error/30 rounded-lg p-4">
    <h3 className="font-semibold text-error mb-2">
      ⚠ {tasks.length} Overdue Tasks
    </h3>
    <ul className="text-sm space-y-1">
      {tasks.slice(0, 3).map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  </div>
);

const TeamCard = ({ team }: { team: any[] }) => (
  <div className="bg-primary rounded-lg p-6">
    <h3 className="font-semibold text-primary-content mb-3">Team Members</h3>
    <ul className="space-y-2 text-sm">
      {team.map((member: any) => (
        <li
          key={member.user._id}
          className="flex justify-between text-primary-content"
        >
          <span>{member.user.name || "Unknown"}</span>
          <span className="">{member.role}</span>
        </li>
      ))}
    </ul>
  </div>
);
const ActivityCard = ({ activity }: { activity: string[] }) => (
  <div className="bg-base-200 border border-base-300 rounded-lg p-6">
    <h3 className="font-semibold mb-3">Recent Activity</h3>
    <ul className="space-y-2 text-sm text-base-content/70">
      {activity.map((item, i) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
  </div>
);
