import API from "@/api/axios";

export interface SalesTask {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  type: string;
  category?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  assignedTo: string;
  team?: string;
  customer: string;
  lead?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  startDate: string;
  dueDate: string;
  dueTime?: string;
  reminderDateTime?: string;
  followUpDate?: string;
  expectedDealValue?: number;
  opportunityStage?: string;
  probability?: number;
  closingDate?: string;
  region?: string;
  communicationType?: string;
  meetingMode?: "Online" | "Offline" | "";
  meetingLocation?: string;
  meetingLink?: string;
  progress: number;
  completionNotes?: string;
  outcome?: string;
  reasonForDelay?: string;
  visibility?: string;
  tags?: string[];
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

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

export const getSalesTaskByEmpId = async(slug:string,params:any) => {
  const response=await API.get(`/tasks/${slug}/get-task-by-empId`, {
    params,
  });
  return response.data;
};