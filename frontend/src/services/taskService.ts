import API from "@/api/axios";

 export const getTasksByProjectId = async (projectId: string, slug: string) => {
  const res = await API.get(`/tasks/${slug}/getTasks/${projectId}`);
  return res.data.data; // depending on your backend structure
}



export const updateTaskStatusService = async (
  slug: string,
  projectId: string,
  taskId: string,
  status: string
) => {
  const { data } = await API.patch(
    `/tasks/${slug}/updateTaskStatus/${projectId}/${taskId}`,
    {
      status,
    }
  );

  return data;
};