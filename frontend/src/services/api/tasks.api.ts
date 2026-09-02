import { API } from "./axios";
import type { SalesTask } from "@/type/task";

export const getTasksByProjectId = async (projectId: string, slug: string) => {
  const res = await API.get(`/tasks/${slug}/getTasks/${projectId}`);
  return res.data.data;
};

export const updateTaskStatusService = async (
  slug: string,
  projectId: string,
  taskId: string,
  status: string
) => {
  const { data } = await API.patch(
    `/tasks/${slug}/updateTaskStatus/${projectId}/${taskId}`,
    { status }
  );
  return data;
};

export const createSalesTask = async (slug: string, payload: Partial<SalesTask>) => {
  const response = await API.post(`/tasks/${slug}/create-sales-task`, payload);
  return response.data;
};

export const getSalesTasks = async (slug: string) => {
  const response = await API.get(`/tasks/${slug}/get-all-sales-tasks`);
  return response.data;
};

export const getSalesTaskById = async (id: string, slug: string) => {
  const response = await API.get(`/tasks/${slug}/sales-tasks/${id}`);
  return response.data;
};

export const updateSalesTask = async (id: string, payload: Partial<SalesTask>, slug: string) => {
  const response = await API.put(`/tasks/${slug}/${id}`, payload);
  return response.data;
};

export const deleteSalesTask = async (id: string, slug: string) => {
  const response = await API.delete(`/tasks/${slug}/sales-tasks/${id}`);
  return response.data;
};

export const getSalesTaskByEmpId = async (slug: string, params: any) => {
  const response = await API.get(`/tasks/${slug}/get-task-by-empId`, { params });
  return response.data;
};
