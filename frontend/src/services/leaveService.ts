import API from "../api/axios";

/**
 * Submits a new leave application.
 * @param {string} slug - The organization's slug.
 * @param {object | FormData} leaveData - The leave data (use FormData if including file attachments).
 * @returns {Promise} Axios promise.
 */
export const applyLeave = (slug: any, leaveData: any) =>
  API.post(`/${slug}/leaves/apply`, leaveData);

/**
 * Fetches all leaves for the currently logged-in user.
 * @param {string} slug - The organization's slug.
 * @returns {Promise} Axios promise.
 */
export const getMyLeaves = (slug: any) =>
  API.get(`/${slug}/leaves/my`);

/**
 * Cancels a pending leave request (User/Employee action).
 * @param {string} slug - The organization's slug.
 * @param {string} leaveId - The ID of the leave request.
 * @returns {Promise} Axios promise.
 */
export const cancelLeave = (slug: any, leaveId: any) =>
  API.patch(`/${slug}/leaves/${leaveId}/cancel`);

/**
 * Deletes a leave request completely (User/Employee action).
 * @param {string} slug - The organization's slug.
 * @param {string} leaveId - The ID of the leave request.
 * @returns {Promise} Axios promise.
 */
export const deleteLeave = (slug: any, leaveId: any) =>
  API.delete(`/${slug}/leaves/${leaveId}`);

/**
 * Updates an existing leave application.
 * @param {string} slug - The organization's slug.
 * @param {string} leaveId - The ID of the leave request.
 * @param {object | FormData} leaveData - The updated leave data.
 * @returns {Promise} Axios promise.
 */
export const updateLeave = (slug: any, leaveId: any, leaveData: any) =>
  API.put(`/${slug}/leaves/${leaveId}`, leaveData);

/**
 * Fetches all leaves across the organization (Admin/Manager action).
 * @param {string} slug - The organization's slug.
 * @param {object} params - Optional query params (e.g., { status: 'pending' }).
 * @returns {Promise} Axios promise.
 */
export const getAllLeaves = (slug: any, params?: any) =>
  API.get(`/${slug}/leaves/all`, { params });

/**
 * Fetches a specific leave by its ID.
 * @param {string} slug - The organization's slug.
 * @param {string} leaveId - The ID of the leave request. 
 * @returns {Promise} Axios promise.
 */
export const getLeaveById = (slug: any, leaveId: any) =>
  API.get(`/${slug}/leaves/${leaveId}`);

/**
 * Updates the status of a leave request (Admin/Manager action).
 * @param {string} slug - The organization's slug.
 * @param {string} leaveId - The ID of the leave request.
 * @param {object} statusData - The new status data (e.g., { status: 'approved', managerRemarks: 'Enjoy your time off!' }).
 * @returns {Promise} Axios promise.
 */
export const updateLeaveStatus = (slug: any, leaveId: any, statusData: any) =>
  API.patch(`/${slug}/leaves/${leaveId}/status`, statusData);

/**
 * Bulk updates the status of multiple leave requests (Admin/Manager action).
 * @param {string} slug - The organization's slug.
 * @param {object} data - The payload containing leaveIds, status, managerRemarks.
 * @returns {Promise} Axios promise.
 */
export const bulkUpdateLeaveStatus = (slug: any, data: any) =>
  API.patch(`/${slug}/leaves/bulk-status`, data);