// services/memberService.js
import API from "../api/axios";

/**
 * Fetches all members for an organization.
 * Note: The backend route for this is not in the provided context.
 * A typical implementation would be a GET request like this.
 * @param {string} slug - The organization's slug.
 * @returns {Promise} Axios promise.
 */
export const getMembers = (slug : any ) => API.get(`/${slug}/members`);

/**
 * Creates a new employee/member in an organization.
 * @param {string} slug - The organization's slug.
 * @param {object} memberData - The data for the new member (e.g., { name, email, password, role }).
 * @returns {Promise} Axios promise.
 */
export const createMember = (slug : any , memberData : any) =>
  API.post(`/${slug}/members`, memberData);

export const getMemberById = (slug : any , userId : any) =>
  API.get(`/${slug}/members/${userId}`);

export const deleteMember = (slug : any , userId : any) =>
  API.delete(`/${slug}/members/${userId}`);

export const updateMember = (slug : any , userId : any, memberData : any) =>
  API.patch(`/${slug}/members/${userId}`, memberData); 


/**
 * Invites a new employee/member to an organization.
 * @param {string} slug - The organization's slug.
 * @param {object} inviteData - The data for the invitation (e.g., { email }).
 * @returns {Promise} Axios promise.
 */
export const inviteMember = (slug, inviteData) =>
  API.post(`/${slug}/members/invite`, inviteData);

/**
 * Updates the role of an existing member.
 * @param {string} slug - The organization's slug.
 * @param {string} userId - The ID of the user to update.
 * @param {object} roleData - The new role data (e.g., { role: 'admin' }).
 * @returns {Promise} Axios promise.
 */
export const updateMemberRole = (slug, userId, roleData) =>
  API.patch(`/${slug}/members/${userId}/role`, roleData);

/**
 * Deactivates a member's account.
 * @param {string} slug - The organization's slug.
 * @param {string} userId - The ID of the user to deactivate.
 * @returns {Promise} Axios promise.
 */
export const deactivateMember = (slug, userId) =>
  API.patch(`/${slug}/members/${userId}/deactivate`);
