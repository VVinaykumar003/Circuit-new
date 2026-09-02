import { API } from "./axios";

export const getMembers = (slug: string) => API.get(`/${slug}/members`);
export const createMember = (slug: string, memberData: any) => API.post(`/${slug}/members`, memberData);
export const getMemberById = (slug: string, userId: string) => API.get(`/${slug}/members/${userId}`);
export const deleteMember = (slug: string, userId: string) => API.delete(`/${slug}/members/${userId}`);
export const updateMember = (slug: string, userId: string, memberData: any) => API.patch(`/${slug}/members/${userId}`, memberData);
export const inviteMember = (slug: string, inviteData: any) => API.post(`/${slug}/members/invite`, inviteData);
export const updateMemberRole = (slug: string, userId: string, roleData: any) => API.patch(`/${slug}/members/${userId}/role`, roleData);
export const getSalesEmployees = (slug: string) => API.get(`/${slug}/members/sales`);
export const deactivateMember = (slug: string, userId: string) => API.patch(`/${slug}/members/${userId}/deactivate`);
