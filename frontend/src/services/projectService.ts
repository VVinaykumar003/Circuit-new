// services/projectService.ts
import API from "@/api/axios";


export const getProjectById = async (projectId: string,slug: string) => {
  const res = await API.get(`/projects/${slug}/getProjectById/${projectId}`);
  return res.data.project; // depending on your backend structure
};
