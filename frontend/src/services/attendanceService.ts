import API from "../api/axios";// Assuming a configured axios instance at './API'

/**
 * [DEPRECATED] Marks or updates attendance for an entire department.
 * @param {string} slug - The organization slug.
 * @param {object} data - The attendance data.
 * @returns {Promise<object>} The updated attendance document.
 */
export const markDepartmentAttendance = (slug, data) => {
  return API.post(`/${slug}/mark-attendance`, data);
};

/**
 * [DEPRECATED] Marks the logged-in employee's own attendance.
 * @param {string} slug - The organization slug.
 * @param {object} data - The attendance data.
 */
export const markAttendance = (slug, data) => {
  return API.post(`/${slug}/attendance/mark`, data);
};

/**
 * [DEPRECATED] Updates an existing attendance sheet's records.
 * @param {string} slug - The organization slug.
 * @param {string} attendanceId - The ID of the attendance document to update.
 * @param {object} data - The update data.
 * @returns {Promise<object>} The updated attendance document.
 */
export const updateAttendance = (slug, attendanceId, data) => {
  return API.put(`/${slug}/attendance/${attendanceId}`, data);
};

/**
 * [NEW] Retrieves the dashboard data for the logged-in employee for today.
 * @param {string} slug - The organization slug.
 * @returns {Promise<object>} The employee's dashboard data including today's attendance status.
 */
export const getEmployeeDashboard = (slug: string) => {
  return API.get(`/${slug}/attendance/today`);
};

/**
 * [NEW] Employee checks in for the day.
 * @param {string} slug - The organization slug.
 * @param {object} [data] - Optional data like geolocation { latitude, longitude, accuracy }.
 * @returns {Promise<object>} The updated attendance record.
 */
export const checkIn = (slug: string, data?: object) => {
  return API.post(`/${slug}/attendance/check-in`, data);
};

/**
 * [NEW] Employee checks out for the day.
 * @param {string} slug - The organization slug.
 * @param {object} [data] - Optional data like geolocation { latitude, longitude, accuracy }.
 * @returns {Promise<object>} The updated attendance record.
 */
export const checkOut = (slug: string, data?: object) => {
  return API.post(`/${slug}/attendance/check-out`, data);
};

/**
 * [NEW] Employee starts a break.
 * @param {string} slug - The organization slug.
 * @returns {Promise<object>} The updated attendance record with a new break entry.
 */
export const startBreak = (slug: string) => {
  return API.post(`/${slug}/attendance/start-break`);
};

/**
 * [NEW] Employee ends the current break.
 * @param {string} slug - The organization slug.
 * @returns {Promise<object>} The updated attendance record with the break end time.
 */
export const endBreak = (slug: string) => {
  return API.post(`/${slug}/attendance/end-break`);
};

/**
 * [NEW] Retrieves the attendance history for the logged-in employee.
 * @param {string} slug - The organization slug.
 * @param {object} [params] - Optional query parameters like { startDate, endDate }.
 * @returns {Promise<Array<object>>} A list of attendance records.
 */
export const getAttendanceHistory = (slug: string, params?: object) => {
  return API.get(`/${slug}/attendance/history`, { params });
};

/**
 * [NEW] Employee applies for attendance regularization (correction).
 * @param {string} slug - The organization slug.
 * @param {object} data - The regularization data { date, checkIn, checkOut, reason }.
 * @returns {Promise<object>} The newly created regularization request.
 */
export const applyRegularization = (slug: string, data: object) => {
  return API.post(`/${slug}/attendance/regularization`, data);
};

/**
 * [NEW] Retrieves dashboard data for admins.
 * @param {string} slug - The organization slug.
 * @returns {Promise<object>} Admin dashboard data including pending requests and stats.
 */
export const getAdminDashboard = (slug: string) => {
  return API.get(`/${slug}/admin/`);
};

/**
 * Approves or updates an employee's attendance record (Admin/Manager action).
 * @param {string} slug - The organization slug.
 * @param {string} attendanceId - The ID of the daily attendance document.
 * @param {object} data - The approval data { employeeId, status, checkOut, remarks }.
 * @returns {Promise<object>} The updated attendance document.
 */
export const approveAttendance = (slug, attendanceId, data) => {
  return API.put(`/${slug}/attendance/approve/${attendanceId}`, data);
};

/**
 * Retrieves all attendance records for the organization (Admin/Manager view).
 * @param {string} slug - The organization slug.
 * @param {object} params - Query parameters.
 * @returns {Promise<Array<object>>} A list of attendance documents.
 */
export const getAttendance = (slug, params) => {
  return API.get(`/attendance/${slug}/attendance/organization`, { params });
};

/**
 * Retrieves all attendance records for the logged-in employee.
 * @param {string} slug - The organization slug.
 * @param {object} [params] - Query parameters.
 * @returns {Promise<Array<object>>} A list of the user's attendance records.
 */
export const getMyAttendance = (slug, params) => {
  return API.get(`/${slug}/attendance/my`, { params });
};

/**
 * Retrieves the attendance summary for a specific employee.
 * @param {string} slug - The organization slug.
 * @param {object} params - Query parameters.
 * @returns {Promise<object>} The employee's attendance summary.
 */
export const getEmployeeAttendanceSummary = (slug, params) => {
  return API.get(`/${slug}/attendance/summary`, { params });
};

/**
 * Retrieves the departments managed by the current user (manager).
 * @param {string} slug - The organization slug.
 */
export const getManagerDepartments = (slug) => {
  return API.get(`/${slug}/attendance/manager-departments`);
};

/**
 * Retrieves all active employees for a specific department or the whole organization.
 * @param {string} slug - The organization slug.
 * @param {string} [departmentId] - The department ID (optional).
 */
export const getDepartmentEmployees = (slug, departmentId) => {
  const params = departmentId ? { departmentId } : {};
  return API.get(`/${slug}/attendance/department-employees`, { params });
};



/** 
 * Retrieves all active employees across the organization.
 * @param {string} slug - The organization slug.
 */
export const getAllEmployees = (slug) => {
  return API.get(`/${slug}/attendance/all-employees`);
};