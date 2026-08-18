import API from "../api/axios";

/**
 * Creates a new organization.
 * @param {object} data - Organization data (name, email, ownerName, etc.).
 * @returns {Promise} Axios promise.
 */
export const createOrganization = (data: any) =>
  API.post("/organization", data);

/**
 * Fetches current organization details.
 * @param {string} slug - The organization's slug.
 * @returns {Promise} Axios promise.
 */
export const getOrganization = (slug: string) =>
  API.get(`/${slug}/organization`);

/**
 * Updates organization details.
 * @param {string} slug - The organization's slug.
 * @param {object} data - Updated organization data.
 * @returns {Promise} Axios promise.
 */
export const updateOrganization = (slug: string, data: any) =>
  API.put(`/${slug}/organization`, data);

/**
 * Deactivates (soft deletes) an organization.
 * @param {string} slug - The organization's slug.
 * @returns {Promise} Axios promise.
 */
export const deactivateOrganization = (slug: string) =>
  API.delete(`/${slug}/organization`);
