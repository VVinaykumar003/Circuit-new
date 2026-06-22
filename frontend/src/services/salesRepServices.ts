import API from "@/api/axios";

export interface SalesRep {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  team: string;
  territory: string;
  status: "Active" | "Inactive" | "On Leave" | "Suspended";
  monthlyTarget: number;
  achievement: number;
  customersAssigned: number;
  leadsAssigned: number;
  ordersHandled: number;
  revenueGenerated: number;
  joiningDate: string;
  reportingManager: string;
  avatarUrl?: string;
  isTopPerformer?: boolean;
  isNewJoiner?: boolean;
}

export const createSalesRep = async (slug: string, payload: Partial<SalesRep> | FormData): Promise<{ success: boolean; data: SalesRep; message?: string }> => {
  const res = await API.post(`/reps/${slug}/create-sales-rep`, payload);
  return res.data;
};

export const getSalesReps = async (slug: string): Promise<{ success: boolean; data: SalesRep[] }> => {
  const res = await API.get(`/reps/${slug}/get-all-sales-reps`);
  return res.data;
};

export const getSalesRepById = async (id: string, slug: string): Promise<{ success: boolean; data: SalesRep }> => {
  const res = await API.get(`/reps/${slug}/get-sales-reps/${id}`);
  return res.data;
};

export const updateSalesRep = async (id: string, payload: Partial<SalesRep> | FormData, slug: string): Promise<{ success: boolean; data: SalesRep; message?: string }> => {
  const res = await API.put(`/reps/${slug}/get-sales-reps/${id}`, payload);
  return res.data;
};

export const deleteSalesRep = async (id: string, slug: string): Promise<{ success: boolean; message?: string }> => {
  const res = await API.delete(`/reps/${slug}/get-sales-reps/${id}`);
  return res.data;
};