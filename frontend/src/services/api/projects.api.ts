import { API } from "./axios";

export const createProject = (slug: string, payload: any) => API.post(`/projects/${slug}/createProject`, payload);
export const getProjects = (slug: string) => API.get(`/projects/${slug}/getProjects`);
export const getProject = getProjects;
export const updateProject = (slug: string, projectId: string, data: any) => API.put(`/projects/${slug}/editProject/${projectId}`, data);
export const deleteProject = (slug: string, projectId: string) => API.delete(`/projects/${slug}/deleteProject/${projectId}`);
