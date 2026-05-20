import API from "../api/axios";// Assuming a configured axios instance at './API'

/**
 * [DEPRECATED FLOW] Marks or updates attendance for an entire department.
 * This is part of the manager-led attendance marking flow.
 * @param {string} slug - The organization slug.
 * @param {object} data - The attendance data.
 * @returns {Promise<object>} The updated attendance document.
 */
export const markDepartmentAttendance = (slug, data) => {
  return API.post(`/attendance/${slug}/mark-attendance`, data);
};

/**
 * [NEW FLOW] Marks the logged-in employee's own attendance.
 * The status will be set to 'PENDING' for admin approval.
 * @param {string} slug - The organization slug.
 * @param {object} data - The attendance data.
 * @param {string} [data.date] - The date for the attendance. Defaults to current date on backend.
 * @param {string} [data.departmentId] - The department ID (optional).
 * @param {number} [data.latitude] - Geolocation latitude.
 * @param {number} [data.longitude] - Geolocation longitude.
 * @param {number} [data.accuracy] - Geolocation accuracy.
 * @returns {Promise<object>} The new or updated attendance document for the day.
 */
export const markAttendance = (slug, data) => {
  return API.post(`/attendance/${slug}/attendance/mark`, data);
};

/**
 * [NEW FLOW] Approves or updates an employee's attendance record (Admin/Manager action).
 * @param {string} slug - The organization slug.
 * @param {string} attendanceId - The ID of the daily attendance document.
 * @param {object} data - The approval data { employeeId, status, checkOut, remarks }.
 * @returns {Promise<object>} The updated attendance document.
 */
export const approveAttendance = (slug, attendanceId, data) => {
  return API.put(`/attendance/${slug}/attendance/approve/${attendanceId}`, data);
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
 * [NEW FLOW] Retrieves all attendance records for the organization (Admin/Manager view).
 * @param {string} slug - The organization slug.
 * @param {object} params - Query parameters.
 * @param {string} [params.departmentId] - Filter by department ID.
 * @param {string} [params.date] - Filter by a single date.
 * @param {string} [params.startDate] - Start of date range in 'YYYY-MM-DD' format.
 * @param {string} [params.endDate] - End of date range in 'YYYY-MM-DD' format.
 * @returns {Promise<Array<object>>} A list of attendance documents.
 */
export const getAttendance = (slug, params) => {
  return API.get(`/attendance/${slug}/attendance/organization`, { params });
};

/**
 * [NEW FLOW] Retrieves all attendance records for the logged-in employee.
 * @param {string} slug - The organization slug.
 * @param {object} [params] - Query parameters.
 * @param {string} [params.startDate] - Start of date range in 'YYYY-MM-DD' format.
 * @param {string} [params.endDate] - End of date range in 'YYYY-MM-DD' format.
 * @returns {Promise<Array<object>>} A list of the user's attendance records.
 */
export const getMyAttendance = (slug, params) => {
  return API.get(`/attendance/${slug}/attendance/my`, { params });
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
  return API.get(`/attendance/${slug}/attendance/summary`, { params });
};

/**
 * Retrieves the departments managed by the current user (manager).
 * @param {string} slug - The organization slug.
 * @returns {Promise<object>} An object containing manager info and their departments.
 */
export const getManagerDepartments = (slug) => {
  return API.get(`/attendance/${slug}/attendance/manager-departments`);
};

/**
 * Retrieves all active employees for a specific department or the whole organization.
 * @param {string} slug - The organization slug.
 * @param {string} [departmentId] - The department ID (optional).
 * @returns {Promise<object>} An object containing department info and a list of employees.
 */
export const getDepartmentEmployees = (slug, departmentId) => {
  const params = departmentId ? { departmentId } : {};
  return API.get(`/attendance/${slug}/attendance/department-employees`, { params });
};



/** 
 * Retrieves all active employees across the organization.
 * @param {string} slug - The organization slug.
 * @returns {Promise<Array<object>>} A list of all active employees.
 * Note: This endpoint is restricted to owners and admins.
 * Each employee object includes: _id, name, email, and department info.
 *  */
export const getAllEmployees = (slug) => {
  return API.get(`/attendance/${slug}/attendance/all-employees`);
};