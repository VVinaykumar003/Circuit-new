import API from "../api/axios";

/**
 * Fetches the organization's leave policy.
 */
export const getLeavePolicy = (slug: any) =>
  API.get(`/${slug}/leave-policy`);

/**
 * Updates the organization's leave policy (Admin action).
 * @param {object} data - Policy data { casual, sick, paid }
 */
export const updateLeavePolicy = (slug: any, data: any) =>
  API.put(`/${slug}/leave-policy`, data);