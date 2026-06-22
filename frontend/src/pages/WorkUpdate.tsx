import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import WorkUpdateForm from "@/components/workUpdate/WorkUpdateForm";
import WorkUpdate from "@/components/workUpdate/WorkUpdates";
import { MdViewList, MdAddChart, MdUpdate, MdWorkspaces } from "react-icons/md";

const WorkUpdates = ({ projectId }: { projectId: string }) => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<"form" | "list">("list");

  useEffect(() => {
    if (projectId) {
      setActiveTab("list");
    }
  }, [projectId]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/20">
            <MdUpdate size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
              Project Updates
            </h1>
            <p className="text-base-content/60 text-sm sm:text-base mt-1 max-w-2xl">
              Track project progress, team activity, and daily work updates to ensure alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Segmented Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-base-200/80 p-1.5 rounded-xl inline-flex gap-1 overflow-x-auto border border-base-200 shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === "list"
                ? "bg-base-100 text-primary shadow-sm border border-base-200"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200"
            }`}
          >
            <MdViewList size={18} />
            View Updates
          </button>
          {!projectId && (
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === "form"
                  ? "bg-base-100 text-primary shadow-sm border border-base-200"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200"
              }`}
            >
              <MdAddChart size={18} />
              Add Update
            </button>
          )}
        </div>

        {/* Context Badge */}
        {projectId && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-info/10 text-info rounded-lg border border-info/20">
            <MdWorkspaces size={18} />
            <span className="text-sm font-medium">Workspace Active</span>
          </div>
        )}
      </div>

      {/* Tab Content Container */}
      <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200 w-full min-h-[500px]">
        <div className="card-body p-0 sm:p-2">
          <div className="p-4 sm:p-6 transition-all duration-300 animate-fade-in">
            {!projectId && activeTab === "form" ? (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 pb-4 border-b border-base-200">
                  <h2 className="text-lg font-bold text-base-content">Create New Update</h2>
                  <p className="text-sm text-base-content/60 mt-1">Share project progress, blockers, and achievements with your team.</p>
                </div>
                <WorkUpdateForm slug={auth.slug} onSuccess={() => setActiveTab("list")} />
              </div>
            ) : (
              <div className="w-full">
                <WorkUpdate slug={auth.slug} projectId={projectId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkUpdates;
