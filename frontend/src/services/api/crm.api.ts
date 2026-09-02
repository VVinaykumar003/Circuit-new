import { API } from "./axios";
import type { Case } from "../caseServices";

// Leads
export const createLead = (slug: string, data: any) => API.post(`/leads/${slug}/create`, data);
export const getAllLeads = (slug: string) => API.get(`/leads/${slug}/getAllLeads`);
export const updateLead = (slug: string, leadId: string, data: any) => API.put(`/leads/${slug}/updateLead/${leadId}`, data);
export const deleteLead = (slug: string, leadId: string) => API.delete(`/leads/${slug}/deleteLead/${leadId}`);

// Accounts
export const createAccount = (slug: string, data: any) => API.post(`/accounts/${slug}/create`, data);
export const getAllAccounts = (slug: string) => API.get(`/accounts/${slug}/get`);
export const updateAccount = (slug: string, accountId: string, data: any) => API.put(`/accounts/${slug}/update/${accountId}`, data);
export const deleteAccount = (slug: string, accountId: string) => API.delete(`/accounts/${slug}/delete/${accountId}`);

// Contacts
export const createContact = (slug: string, data: any) => API.post(`/contacts/${slug}/create`, data);
export const getAllContacts = (slug: string) => API.get(`/contacts/${slug}/get`);
export const updateContact = (slug: string, contactId: string, data: any) => API.put(`/contacts/${slug}/update/${contactId}`, data);
export const deleteContact = (slug: string, contactId: string) => API.delete(`/contacts/${slug}/delete/${contactId}`);

// Cases
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

// Sales Reps
export const getSalesReps = (slug: string) => API.get(`/${slug}/members/sales`);
export const createSalesRep = (slug: string, data: any) => API.post(`/${slug}/members/sales`, data);
export const getSalesRepById = (slug: string, repId: string) => API.get(`/${slug}/members/sales/${repId}`);
export const updateSalesRep = (slug: string, repId: string, data: any) => API.patch(`/${slug}/members/sales/${repId}`, data);
export const deleteSalesRep = (slug: string, repId: string) => API.delete(`/${slug}/members/sales/${repId}`);

// Dashboard
export const getSalesDashboardData = (slug: string) => API.get(`sales/${slug}/dashboard`);
