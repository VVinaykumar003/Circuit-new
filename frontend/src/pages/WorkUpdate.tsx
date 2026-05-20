import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import WorkUpdateForm from "@/components/workUpdate/WorkUpdateForm";
import WorkUpdate from "@/components/workUpdate/WorkUpdates";

const WorkUpdates = ({ projectId }: { projectId: string }) => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<"form" | "list">("list");
  useEffect(() => {
    if (projectId) {
      setActiveTab("list");
    }
  }, [projectId]);
  return (
    <div className="p-5">
      {/* Tabs Header */}
      <div className="flex gap-6 border-b border-base-300 mb-5">
         <button
          onClick={() => setActiveTab("list")}
          className={`pb-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "list"
              ? "text-primary border-b-2 border-primary"
              : "text-base-content/60 hover:text-base-content"
          }`}
        >
          View Updates
        </button>
        {/*  Only show when NO projectId */}
        {!projectId && (
          <button
            onClick={() => setActiveTab("form")}
            className={`pb-2 text-sm font-medium transition-all duration-200 ${
              activeTab === "form"
                ? "text-primary border-b-2 border-primary"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Add Update
          </button>
        )}

       
      </div>

      {/* Tab Content */}
      <div>
        {!projectId && activeTab === "form" ? (
          <WorkUpdateForm slug={auth.slug} />
        ) : (
          <WorkUpdate slug={auth.slug} projectId={projectId} />
        )}
      </div>
    </div>
  );
};

export default WorkUpdates;
