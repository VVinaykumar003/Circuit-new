import { API } from "./axios";

export const createOrganization = (data: any) => API.post("/organization", data);
export const getOrganization = (slug: string) => API.get(`/${slug}/organization`);
export const updateOrganization = (slug: string, data: any) => API.put(`/${slug}/organization`, data);
export const deactivateOrganization = (slug: string) => API.delete(`/${slug}/organization`);
