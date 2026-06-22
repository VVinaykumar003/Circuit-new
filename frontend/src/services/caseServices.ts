import API from "@/api/axios";

export type CasePriority = "Low" | "Medium" | "High" | "Critical";
export type CaseStatus = "Open" | "Assigned" | "In Progress" | "Waiting For Customer" | "Resolved" | "Closed" | "Escalated";
export type CaseType = "Complaint" | "Support Request" | "Product Issue" | "Refund Request" | "Warranty Claim" | "Escalation" | "Service Request";
export type SLAStatus = "On Track" | "Near Breach" | "Breached";

export interface CaseComment {
  _id?: string;
  id: string;
  type: "Internal" | "Customer";
  user: string;
  text: string;
  timestamp: string;
}

export interface CaseTimelineItem {
  _id?: string;
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: "create" | "assign" | "status" | "escalate" | "comment" | "resolve" | "close";
}

export interface Case {
  _id?: string;
  id: string;
  caseNumber: string;
  subject: string;
  description: string;
  customer: string;
  contactPerson?: string;
  product?: string;
  relatedOrder?: string;
  type: CaseType;
  priority: CasePriority;
  status: CaseStatus;
  assignedRep: string;
  dueDate: string;
  createdDate: string;
  lastUpdated: string;
  slaStatus: SLAStatus;
  resolutionNotes?: string;
  resolutionDate?: string;
  resolutionTimeHours?: number;
  attachments?: string[];
  comments: CaseComment[];
  timeline: CaseTimelineItem[];
}

/* ─────────────────────────── API SERVICES ─────────────────────────── */

export const getCases = async (slug: string) => {
  const response = await API.get(`/cases/${slug}/cases`);
  return response.data;
};

export const createCase = async (slug: string, payload: Partial<Case>) => {
  const response = await API.post(`/cases/${slug}/cases`, payload);
  return response.data;
};

export const updateCase = async (id: string, payload: Partial<Case>, slug: string) => {
  const response = await API.put(`/cases/${slug}/cases/${id}`, payload);
  return response.data;
};

export const deleteCase = async (id: string, slug: string) => {
  const response = await API.delete(`/cases/${slug}/cases/${id}`);
  return response.data;
};

export const getCaseById = async (id: string, slug: string) => {
  const response = await API.get(`/cases/${slug}/cases/${id}`);
  return response.data;
};
