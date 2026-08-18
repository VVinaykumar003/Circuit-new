import API from "@/api/axios";


export const getActivities = async (slug: string) => {
  const res = await API.get(`/activity/${slug}`);
  return res.data.activities;
};