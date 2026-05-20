import API from "../api/axios";

/**
 * Publishes a new holiday.
 * @param {string} slug - The organization's slug.
 * @param {object} data - Holiday data { date, title, description }.
 * @returns {Promise} Axios promise.
 */
export const createProject = (slug: any, payload: any) =>
  API.post(`/projects/${slug}/createProject`, payload);

/**
 * Fetches all official company holidays.
 */
export const getProject = (slug: any) =>
  API.get(`/projects/${slug}/getProjects`);

/**
 * Updates an existing holiday.
 */
export const updateProject = (slug: any, projectId: any, data: any) =>
  API.put(`/projects/${slug}/editProject/${projectId}`, data);

/**
 * Deletes a holiday.
 */
export const deleteProject = (slug: any, projectId: any) =>
  API.delete(`/projects/${slug}/deleteProject/${projectId}`);