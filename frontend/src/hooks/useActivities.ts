import { useAuth } from "@/auth/useAuth"; 
import { getActivities } from "@/services/IT/activityService";
import { useEffect, useState } from "react";


export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const {auth} = useAuth();
  const slug = auth?.slug || "";

  useEffect(() => {
    const load = async () => {
      const data = await getActivities(slug);
      // console.log("Fetched activities:", data);
      setActivities(data);
    };

    load();
  }, [slug]);

  return { activities, setActivities };
};