import API from "../api/axios";

/**
 * Marks or updates attendance for a department or the whole organization.
 * @param {string} slug - The organization slug.
 * @param {object} data - The attendance data.
 * @param {string} data.date - The date for the attendance in 'YYYY-MM-DD' format.
 * @param {string} [data.departmentId] - The department ID (optional).
 * @param {Array<object>} data.attendance - Array of attendance records.
 * @param {number} [data.latitude] - Geolocation latitude.
 * @param {number} [data.longitude] - Geolocation longitude.
 * @param {number} [data.accuracy] - Geolocation accuracy.
 * @returns {Promise<object>} The new or updated attendance document.
 */
export const markAttendance = (slug, data) => {
  return API.post(`/${slug}/mark-attendance`, data);
};

/**
 * Updates an existing attendance sheet's records.
 * @param {string} slug - The organization slug.
 * @param {string} attendanceId - The ID of the attendance document to update.
 * @param {object} data - The update data.
 * @param {Array<object>} data.records - The updated array of attendance records.
 * @returns {Promise<object>} The updated attendance document.
 */
export const updateAttendance = (slug, attendanceId, data) => {
  return API.put(`/${slug}/attendance/${attendanceId}`, data);
};

/**
 * Retrieves attendance records for a department or the whole organization.
 * @param {string} slug - The organization slug.
 * @param {object} params - Query parameters.
 * @param {string} [params.departmentId] - Filter by department ID.
 * @param {string} [params.startDate] - Start of date range in 'YYYY-MM-DD' format.
 * @param {string} [params.endDate] - End of date range in 'YYYY-MM-DD' format.
 * @returns {Promise<Array<object>>} A list of attendance documents.
 */
export const getAttendance = (slug, params) => {
  return API.get(`/${slug}/attendance`, { params });
};

/**
 * Retrieves the attendance summary for a specific employee.
 * @param {string} slug - The organization slug.
 * @param {object} params - Query parameters.
 * @param {string} params.employeeId - The employee's ID.
 * @param {string} [params.startDate] - Start of date range in 'YYYY-MM-DD' format.
 * @param {string} [params.endDate] - End of date range in 'YYYY-MM-DD' format.
 * @returns {Promise<object>} The employee's attendance summary.
 */
export const getEmployeeAttendanceSummary = (slug, params) => {
  return API.get(`/${slug}/attendance/summary`, { params });
};

/**
 * Retrieves the departments managed by the current user (manager).
 * @param {string} slug - The organization slug.
 * @returns {Promise<object>} An object containing manager info and their departments.
 */
export const getManagerDepartments = (slug) => {
  return API.get(`/${slug}/attendance/manager-departments`);
};

/**
 * Retrieves all active employees for a specific department or the whole organization.
 * @param {string} slug - The organization slug.
 * @param {string} [departmentId] - The department ID (optional).
 * @returns {Promise<object>} An object containing department info and a list of employees.
 */
export const getDepartmentEmployees = (slug, departmentId) => {
  const params = departmentId ? { departmentId } : {};
  return API.get(`/${slug}/attendance/department-employees`, { params });
};