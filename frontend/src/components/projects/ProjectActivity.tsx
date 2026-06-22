import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import API from "@/api/axios";

interface Props {
  projectId: string;
}

interface Activity {
  _id: string;
  action: string;
  message: string;
  createdAt: string;
}

export default function ProjectActivity({ projectId }: Props) {
  const { auth } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/activity/${auth.slug}`);
        const allActivities = res.data?.activities || res.data?.data || [];
        
        // Filter activities specifically for this project
        const projectActivities = allActivities.filter(
          (act: any) => act.referenceId === projectId
        );
        
        setActivities(projectActivities);
      } catch (err) {
        console.error("Failed to fetch activities", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.slug && projectId) {
      fetchActivities();
    }
  }, [auth.slug, projectId]);

  return (
    <div className="bg-white/70  border border-base-300 rounded-lg p-6">
      <h3 className="font-semibold text-black mb-4">
        Activity Timeline
      </h3>

      {loading ? (
        <div className="flex justify-center p-4">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-black/50">No recent activity for this project.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity._id} className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />

              <div>
                <p className="text-sm text-black">
                  {activity.message}
                </p>
                <p className="text-xs text-black/50">
                  {new Date(activity.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
