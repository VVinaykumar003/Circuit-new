const Attendance = require('../models/Attendance.model.js');
const Department = require('../models/Department.model.js');
const User = require('../models/User.model.js'); // Assuming you use a shared User model for Employees & Managers
const { successResponse } = require('../utils/response.js');
const { asyncHandler } = require('../middlewares/error.middleware.js');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors.js');
const logger = require("../common/libs/logger.js")
const { getIO } = require('../services/socket.service.js');

// Mark Department Attendance - MULTI-TENANT
const markDepartmentAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  logger.info(`user  : ${userId}`);
  const userRole = req.user.role;
  logger.info(`user role : ${userRole}`);
  const {
    date,
    departmentId,
    attendance,
    latitude,
    longitude,
    accuracy
  } = req.body;



  if (!date || !attendance) {
    throw new ValidationError('Date and attendance records are required');
  }

  // Security check: Employees can only mark their own attendance.
  // if ( userRole === 'member') {
  //   if (attendance.length !== 1 || attendance[0].employeeId.toString() !== userId.toString()) {
  //     throw new ForbiddenError('You only have permission to mark your own attendance.');
  //   }
  // }

  const records = attendance.map((item) => ({
    employee: item.employeeId,
    status: item.status,
    checkIn: item.checkIn || null,
    checkOut: item.checkOut || null,
    remarks: item.remarks || '',
  }));

  logger.info(`record : ${records}`);

  // Recalculate totals
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDay = 0;

  records.forEach((record) => {
    if (record.status === 'PRESENT') totalPresent++;
    else if (record.status === 'ABSENT') totalAbsent++;
    else if (record.status === 'HALF_DAY') totalHalfDay++;
  });
  
  const totalEmployees = records.length;
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0); // Normalize date to start of day

  // ✅ MULTI-TENANT: Check if attendance already exists for this team/date
  const existing = await Attendance.findOne({
    organization: req.organization,
    department: departmentId || null,
    date: queryDate
  });

  if (existing) {
    // Merge the new attendance records into the existing sheet
    records.forEach(newRecord => {
      const existingRecordIndex = existing.records.findIndex(
        r => r.employee.toString() === newRecord.employee.toString()
      );
      
      if (existingRecordIndex >= 0) {
        // Update existing record
        existing.records[existingRecordIndex].status = newRecord.status;
        if (newRecord.checkIn) existing.records[existingRecordIndex].checkIn = newRecord.checkIn;
        if (newRecord.checkOut) existing.records[existingRecordIndex].checkOut = newRecord.checkOut;
        if (newRecord.remarks) existing.records[existingRecordIndex].remarks = newRecord.remarks;
      } else {
        // Add new record
        existing.records.push(newRecord);
      }
    });

    // Recalculate totals for the merged records
    totalPresent = 0;
    totalAbsent = 0;
    totalHalfDay = 0;

    existing.records.forEach((record) => {
      if (record.status === 'PRESENT') totalPresent++;
      else if (record.status === 'ABSENT') totalAbsent++;
      else if (record.status === 'HALF_DAY') totalHalfDay++;
    });

    existing.totalPresent = totalPresent;
    existing.totalAbsent = totalAbsent;
    existing.totalHalfDay = totalHalfDay;
    existing.totalEmployees = existing.records.length;

    if (['admin', 'owner', 'manager'].includes(userRole)) {
      existing.markedBy = userId;
    }

    if (latitude && longitude) {
      existing.location = { latitude, longitude, accuracy };
    }

    existing.markModified('records');
    await existing.save();
    return successResponse(res, 'Attendance updated successfully', existing);
  }

  // Create new attendance record
  const newAttendance = await Attendance.create({
    organization: req.organization,
    date: queryDate,
    department: departmentId || null,
    records,
    totalPresent,
    totalAbsent,
    totalHalfDay,
    totalEmployees,
    markedBy: userId,
    location: (latitude && longitude) ? { latitude, longitude, accuracy } : undefined
  });


  const io = getIO();

  io.to(userId).emit("notification", {
    title: "New Attendance Marked",
    message: `Attendance for ${queryDate.toDateString()} has been marked.`,
    type: "attendance",
  });

  return successResponse(res, 'Attendance marked successfully', newAttendance);
});

// Get attendance by Department - MULTI-TENANT
const getAttendanceByDepartment = asyncHandler(async (req, res) => {
  const { departmentId, startDate, endDate } = req.query;

  const filter = {
    organization: req.organization
  };

  if (departmentId) {
    filter.department = departmentId;
  }
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendance = await Attendance.find(filter)
    .populate('markedBy', 'name email')
    .sort({ date: -1 });

  return successResponse(res, 'Department attendance retrieved successfully', attendance);
});

// Update single attendance document - MULTI-TENANT
const updateAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const { records } = req.body;
  
  const attendance = await Attendance.findOne({
    _id: attendanceId,
    organization: req.organization
  });
  
  if (!attendance) {
    throw new NotFoundError('Attendance record');
  }
  
  if (attendance.markedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'owner') {
    throw new ForbiddenError('You do not have permission to update this record');
  }
  
  // Recalculate totals
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDay = 0;
  
  records.forEach(record => {
    if (record.status === 'PRESENT') totalPresent++;
    else if (record.status === 'ABSENT') totalAbsent++;
    else if (record.status === 'HALF_DAY') totalHalfDay++;
  });
  
  attendance.records = records;
  attendance.totalPresent = totalPresent;
  attendance.totalAbsent = totalAbsent;
  attendance.totalHalfDay = totalHalfDay;
  
  await attendance.save();
  
  return successResponse(res, 'Attendance updated successfully', attendance);
});

// Get specific Employee attendance summary (For Payroll or Profile) - MULTI-TENANT
const getEmployeeAttendanceSummary = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate } = req.query;
  
  if (!employeeId) {
    throw new ValidationError('Employee ID is required');
  }
  
  const filter = {
    organization: req.organization,
    'records.employee': employeeId,
  };
  
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const attendanceRecords = await Attendance.find(filter);
  
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDay = 0;
  let totalLeaves = 0;
  let totalWorkingDays = 0;
  
  attendanceRecords.forEach(record => {
    const employeeRecord = record.records.find(r => r.employee.toString() === employeeId);
    if (employeeRecord) {
      totalWorkingDays++;
      if (employeeRecord.status === 'PRESENT') totalPresent++;
      else if (employeeRecord.status === 'ABSENT') totalAbsent++;
      else if (employeeRecord.status === 'HALF_DAY') totalHalfDay++;
      else if (employeeRecord.status === 'ON_LEAVE') totalLeaves++;
    }
  });
  
  // Half days typically count as 0.5 for payroll/percentage calculation
  const calculatedPresent = totalPresent + (totalHalfDay * 0.5);
  const attendancePercentage = totalWorkingDays > 0 
    ? ((calculatedPresent / totalWorkingDays) * 100).toFixed(2) 
    : 0;
  
  return successResponse(res, 'Employee attendance summary retrieved', {
    totalWorkingDays,
    totalPresent,
    totalAbsent,
    totalHalfDay,
    totalLeaves,
    attendancePercentage: Number(attendancePercentage)
  });
});

// Get Departments managed by the logged-in Manager - MULTI-TENANT
const getManagerDepartments = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  // Assuming Department model has a 'manager' or 'departmentHead' field
  const departments = await Department.find({
    organization: req.organization,
    manager: managerId
  }).select('name description status');

  return successResponse(res, 'Manager departments retrieved', {
    manager: { id: managerId, name: req.user.name },
    departments,
    canMarkAttendance: departments.length > 0
  });
});

// Get all Employees in a specific Department - MULTI-TENANT
const getDepartmentEmployees = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;

  // ================== DATE NORMALIZATION ==================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ================== VERIFY DEPARTMENT ==================
  let department;
  if (departmentId) {
    department = await Department.findOne({
      _id: departmentId,
      organization: req.organization,
    }).lean();

    if (!department) {
      throw new NotFoundError("Department not found");
    }
  }

  // ================== EMPLOYEE FILTER ==================
  const employeeFilter = {
    organization: req.organization,
    status: "active",
    role: "member", // ⚠️ FIX: your enum is member, not employee
  };

  if (departmentId) {
    employeeFilter.department = departmentId;
  }

  // ================== FETCH EMPLOYEES ==================
  const employees = await User.find(employeeFilter)
    .select("name email designation")
    .sort({ name: 1 })
    .lean();

  // ================== FETCH TODAY ATTENDANCE ==================
  const attendance = await Attendance.findOne({
    organization: req.organization,
    department: departmentId || null,
    date: today,
  }).lean();

  // Create map for fast lookup
  const attendanceMap = new Map();

  if (attendance) {
    attendance.records.forEach((record) => {
      attendanceMap.set(record.employee.toString(), record);
    });
  }

  // ================== FORMAT RESPONSE ==================
  const formatted = employees.map((emp) => {
    const record = attendanceMap.get(emp._id.toString());

    return {
      employeeId: emp._id.toString(),
      name: emp.name,
      designation: emp.designation,

      // 🔥 CORE LOGIC
      status: record ? record.status : "NOT_MARKED",

      checkIn: record?.checkIn || null,
      mode: record?.mode || null,
      checkOut: record?.checkOut || null,
      remarks: record?.remarks || "",
    };
  });

  // ================== RESPONSE ==================
  return successResponse(res, "Department employees retrieved", {
    departmentId: departmentId || null,
    departmentName: department ? department.name : "All Employees",
    date: today,
    totalEmployees: formatted.length,
    employees: formatted,
  });
});


const getAllEmployees = asyncHandler(async (req, res) => {
const userId = req.user.id;

logger.info(`user  : ${userId}`);


if (!userId) {
  throw new ForbiddenError('You do not have permission to access this resource.');
}


const userRole = req.user.role;

logger.info(`user role : ${userRole}`);

if (userRole !== 'admin' && userRole !== 'owner') {
  throw new ForbiddenError('You do not have permission to access this resource.');
}


  const employees = await User.find({
    organization: req.organization,
    status: 'active',
    role: 'member'
  }).select('name email employeeId designation').sort({ name: 1 }).lean();
  return successResponse(res, 'All employees retrieved', employees);
});

// ============================================================================
// NEW ROLE-BASED ATTENDANCE FLOW (Employee marks PENDING -> Admin Approves)
// ============================================================================

// 1. Employee marks attendance (PENDING)
const markAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const orgId = req.organization._id || req.organization;
  const { latitude, longitude, accuracy, departmentId, date, mode } = req.body;

  // Auto date handling: Use current date if not provided, normalized to start of day
  const queryDate = date ? new Date(date) : new Date();
  queryDate.setHours(0, 0, 0, 0);

  logger.info(`User ${userId} marking attendance for ${queryDate}`);

  const existing = await Attendance.findOne({
    organization: orgId,
    date: queryDate,
    department: departmentId || null
  });
   
  console.log(existing);


  const newRecord = {
    employee: userId,
    status: 'PENDING',
    checkIn: new Date(),
    mode: mode || 'office',
  };

  // Helper to notify admins via socket
  const notifyAdmins = async () => {
    try {
      const io = getIO();
      const admins = await User.find({ organization: orgId, role: { $in: ['admin', 'owner', 'manager'] } });
      const employee = await User.findById(userId);
      const empName = employee ? employee.name : "An employee";
      
      admins.forEach(admin => {
        // Changed to 'new_notification' to trigger Header.tsx sound & badge
        io.to(admin._id.toString()).emit('new_notification', {
          title: "New Attendance",
          message: `${empName} marked their attendance.`,
          priority: "normal"
        });
      });
    } catch (err) {
      logger.error("Socket emit failed", err);
    }
  };

  if (existing) {
    // Prevent duplicate attendance: Check if employee already marked today
    const recordIndex = existing.records.findIndex(r => r.employee.toString() === userId.toString());
    
    if (recordIndex >= 0) {
      // Update existing record instead of creating a duplicate
      existing.records[recordIndex].checkIn = new Date();
      existing.records[recordIndex].status = 'PENDING';
      existing.records[recordIndex].mode = mode || 'office';
    } else {
      existing.records.push(newRecord);
    }

    existing.totalEmployees = existing.records.length;
    
    if (latitude && longitude) {
      existing.location = { latitude, longitude, accuracy };
    }

    existing.markModified('records');
    await existing.save();

    await notifyAdmins();

    return successResponse(res, 'Attendance marked successfully', existing);
  }

  // Create new attendance document for the day if it doesn't exist
  const newAttendance = await Attendance.create({
    organization: orgId,
    date: queryDate,
    department: departmentId || null,
    records: [newRecord],
    totalPresent: 0,
    totalAbsent: 0,
    totalHalfDay: 0,
    totalEmployees: 1,
    markedBy: userId, 
    location: (latitude && longitude) ? { latitude, longitude, accuracy } : undefined
  });

  await notifyAdmins();

  return successResponse(res, 'Attendance marked successfully', newAttendance);
});

// 2. Admin approves/updates attendance
const approveAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const { employeeId, status, checkOut, remarks } = req.body;
  const userRole = req.user.role;
  const orgId = req.organization._id || req.organization;

  logger.info(`Admin ${req.user.id || req.user._id} approving attendance doc ${attendanceId} for employee ${employeeId}`);

  if (!['admin', 'owner', 'manager'].includes(userRole)) {
    throw new ForbiddenError('You do not have permission to approve attendance');
  }

  if (!employeeId || !status) {
    throw new ValidationError('employeeId and status are required');
  }

  const attendance = await Attendance.findOne({
    _id: attendanceId,
    organization: orgId
  });

  if (!attendance) {
    throw new NotFoundError('Attendance record');
  }

  const recordIndex = attendance.records.findIndex(r => r.employee.toString() === employeeId.toString());
  
  if (recordIndex === -1) {
    throw new NotFoundError('Employee not found in this attendance sheet');
  }

  // Update the employee's record
  attendance.records[recordIndex].status = status;
  if (checkOut) attendance.records[recordIndex].checkOut = new Date(checkOut);
  if (remarks) attendance.records[recordIndex].remarks = remarks;

  // Recalculate daily totals
  let totalPresent = 0, totalAbsent = 0, totalHalfDay = 0;

  attendance.records.forEach((record) => {
    if (record.status === 'PRESENT') totalPresent++;
    else if (record.status === 'ABSENT') totalAbsent++;
    else if (record.status === 'HALF_DAY') totalHalfDay++;
  });

  attendance.totalPresent = totalPresent;
  attendance.totalAbsent = totalAbsent;
  attendance.totalHalfDay = totalHalfDay;
  attendance.markedBy = req.user.id || req.user._id;

  attendance.markModified('records');
  await attendance.save();

  // Notify the employee about the status update
  try {
    const io = getIO();
    io.to(employeeId.toString()).emit('new_notification', {
      title: "Attendance Updated",
      message: status === "PRESENT" ? "Your attendance is approved ✅" : `Your attendance status has been updated to ${status}.`,
      priority: "normal"
    });
  } catch (err) {
    logger.error("Socket emit failed", err);
  }

  return successResponse(res, 'Attendance approved successfully', attendance);
});

// 3. Employee can view their attendance
const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const orgId = req.organization._id || req.organization;
  const { startDate, endDate, date } = req.query;

  const filter = {
    organization: orgId,
    'records.employee': userId
  };

  if (date) {
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    filter.date = queryDate;
  } else if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const attendances = await Attendance.find(filter).sort({ date: -1 });

  // Format response to only extract the specific user's records from the document arrays
  const myAttendance = attendances.map(doc => {
    const myRecord = doc.records.find(r => r.employee.toString() === userId.toString());
    return {
      attendanceId: doc._id,
      date: doc.date,
      department: doc.department,
      location: doc.location,
      record: myRecord
    };
  });

  return successResponse(res, 'My attendance retrieved successfully', myAttendance);
});

// 4. Admin/Owner can view all attendance
const getOrganizationAttendance = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const orgId = req.organization._id || req.organization;
  const { date, startDate, endDate, departmentId } = req.query;

  if (!['admin', 'owner', 'manager'].includes(userRole)) {
    throw new ForbiddenError('You do not have permission to view organization attendance');
  }

  const filter = { organization: orgId };

  if (date) {
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    filter.date = queryDate;
  } else if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (departmentId) {
    filter.department = departmentId;
  }

  const attendances = await Attendance.find(filter)
    .populate('records.employee', 'name email designation')
    .populate('markedBy', 'name email')
    .sort({ date: -1 });

  return successResponse(res, 'Organization attendance retrieved successfully', attendances);
});

module.exports = {
  markDepartmentAttendance,
  getAttendanceByDepartment,
  updateAttendance,
  getEmployeeAttendanceSummary,
  getManagerDepartments,
  getDepartmentEmployees,

  getAllEmployees,
  markAttendance,
  approveAttendance,
  getMyAttendance,
  getOrganizationAttendance
};
