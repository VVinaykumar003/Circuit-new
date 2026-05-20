import API from "@/api/axios";

 export const getTasksByProjectId = async (projectId: string, slug: string) => {
  const res = await API.get(`/tasks/${slug}/getTasks/${projectId}`);
  return res.data.data; // depending on your backend structure
}