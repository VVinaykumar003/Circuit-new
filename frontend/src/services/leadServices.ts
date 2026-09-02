import API from "@/api/axios";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  leadOwner: string;
  source: string;
  industry: string;
  status: "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Negotiation" | "Won" | "Lost";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdDate: string;
  lastContacted: string;
  value?: number;
}

export const createLead = async (slug: string, payload: Partial<Lead>): Promise<{ success: boolean; data: Lead; message?: string }> => {
  const res = await API.post(`/leads/${slug}/create-leads`, payload);
  return res.data;
};

export const getLeads = async (slug: string): Promise<{ success: boolean; data: Lead[] }> => {
  const res = await API.get(`/leads/${slug}/getAllLeads`);
  return res.data;
};

export const updateLead = async (leadId: string, payload: Partial<Lead>, slug: string): Promise<{ success: boolean; data: Lead; message?: string }> => {
  const res = await API.put(`/leads/${slug}/updateLead/${leadId}`, payload);
  return res.data;
};

export const deleteLead = async (leadId: string, slug: string): Promise<{ success: boolean; message?: string }> => {
  const res = await API.delete(`/leads/${slug}/deleteLead/${leadId}`);
  return res.data;
};

export const convertLeadToCustomer = async (slug: string, leadId: string) => {
  const res = await API.post(`/leads/${slug}/convertLeadToCustomer/${leadId}`);
  return res.data;
};

export const bulkDeleteLeads = async (leadIds: string[], slug: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await API.post(`/leads/${slug}/bulk-delete-leads`, { leadIds });
    return res.data;
  } catch (err) {
    // Fallback: Delete individually in parallel if bulk endpoint is unavailable
    await Promise.all(leadIds.map((id) => API.delete(`/leads/${slug}/deleteLead/${id}`)));
    return { success: true, message: "Leads deleted successfully" };
  }
};