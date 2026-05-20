import API from "../api/axios";

/**
 * Publishes a new holiday.
 * @param {string} slug - The organization's slug.
 * @param {object} data - Holiday data { date, title, description }.
 * @returns {Promise} Axios promise.
 */
export const addHoliday = (slug: any, data: any) =>
  API.post(`/${slug}/holidays`, data);

/**
 * Fetches all official company holidays.
 */
export const getHolidays = (slug: any) =>
  API.get(`/${slug}/holidays`);

/**
 * Updates an existing holiday.
 */
export const updateHoliday = (slug: any, holidayId: any, data: any) =>
  API.put(`/${slug}/holidays/${holidayId}`, data);

/**
 * Deletes a holiday.
 */
export const deleteHoliday = (slug: any, holidayId: any) =>
  API.delete(`/${slug}/holidays/${holidayId}`);