const mongoose = require('mongoose');
const Company = require('../models/Organization.model.js');
const CompanyPolicy = require('../models/CompanySalaryPolicy.js');
const Payroll = require('../models/Payroll.js');
const Employee = require('../models/User.model.js');
const PDFDocument = require('pdfkit');
const { successResponse } = require('../utils/response.js');
const { asyncHandler } = require('../middlewares/error.middleware.js');
const { ValidationError, NotFoundError } = require('../utils/errors.js');
const logger = require("../common/libs/logger.js");
const { getIO } = require('../services/socket.service.js');

// ✅ GET: Fetch basic employee stats for payroll preparation
const getEmployeePayrollStats = asyncHandler(async (req, res) => {
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  const employees = await Employee.find({ organization: organizationId, isActive: true })
    .select('name employeeID department role _id');

  const stats = employees.map((employee) => ({
    employeeId: employee._id,
    name: employee.name,
    employeeID: employee.employeeID,
    department: employee.department,
    role: employee.role
  }));

  return successResponse(res, "Employee payroll preparation statistics retrieved", stats);
});

// ✅ POST: Calculate and set salary structure for an employee
const calculateAndSetSalary = asyncHandler(async (req, res) => {

  const { employeeId, monthlyGross, taxRegime, limitPF, customEarnings, customDeductions } = req.body;
  logger.info("Calculating salary structure with payload", { employeeId, monthlyGross, taxRegime, limitPF });
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  if (!employeeId || !monthlyGross) {
    throw new ValidationError("Employee ID and Monthly Gross are required");
  }

  // 1. Fetch Global Organization Policy
  let policy = await CompanyPolicy.findOne({ companyId: organizationId });
  if (!policy) {
    policy = {
      payrollSettings: {
        basicPercent: 
50,
        hraPercent: 20,
        daPercent: 10
        }
    };
  }


  // Default standards fallback
  // const bPct = (policy?.payrollSettings?.basicPercent || 50) / 100;
  // const hPct = (policy?.payrollSettings?.hraPercent || 20) / 100;
  // const dPct = (policy?.payrollSettings?.daPercent || 10) / 100;

  // const basic = monthlyGross * bPct;
  // const da = basic * dPct;
  // const hra = basic * hPct;
  // const specialAllowance = monthlyGross - (basic + da + hra);

const basic = monthlyGross;
  // 3. EPF Calculation (12% of Basic + DA)
  let pfBasis = basic ;
  if (limitPF && pfBasis > 15000) pfBasis = 15000; // Statutory Ceiling
  const epfEmployee = pfBasis * 0.12;
  const epfEmployer = pfBasis * 0.12;

  // 4. Gratuity Provision
  // const gratuityProvision = (basic + da) / 26 * 15 / 12;
  const gratuityProvision = basic / 26 * 15 / 12;

  // 5. TDS Estimation
  const annualTaxable = (monthlyGross * 12) - 75000;
  let annualTds = 0;
  if (annualTaxable > 1200000) {
    annualTds = (annualTaxable - 1200000) * 0.10;
  }
  const monthlyTds = annualTds / 12;

  const netSalary = monthlyGross - (epfEmployee + monthlyTds + 200); // 200 for PT

  const payrollData = {
    organization: organizationId,
    employeeId,
    customEarnings: customEarnings || [],
customDeductions: customDeductions || [],
    ctc: monthlyGross + epfEmployer + gratuityProvision,
    grossSalary: monthlyGross,
    earnings: { basic },
    deductions: { epfEmployee, tds: monthlyTds, professionalTax: 200 },
    statutory: { epfEmployer, gratuityProvision },
    netSalary,
    taxRegime: taxRegime ? taxRegime.toUpperCase() : 'NEW',
    isTemplate: true,
    month: null,
    year: null,
    paymentStatus: null
  };

  const savedPayroll = await Payroll.findOneAndUpdate(
    { employee: employeeId, organization: organizationId, isTemplate: true },
    payrollData,
    { upsert: true, returnDocument: 'after', runValidators: true }
  );
  logger.info("Salary structure saved successfully", { savedPayroll });

  return successResponse(res, "Salary structure saved successfully", savedPayroll);
});

// ✅ POST: Run monthly payroll with Manual Override support (Independent of Attendance)
const runMonthlyPayroll = asyncHandler(async (req, res) => {
  const organizationId = req.organization?._id || req.organization || req.user?.organization;
  logger.info("Initiating monthly payroll run with payload", { body: req.body, organizationId });
  const { month, year, employeeId, employeeIds, extraEarnings, manualAmount } = req.body; 

  let targetEmployeeIds = [];
  if (Array.isArray(employeeIds)) {
    targetEmployeeIds = employeeIds;
  } else if (employeeId) {
    targetEmployeeIds = [employeeId];
  } else {
    const allEmployees = await Employee.find({ organization: organizationId, status: 'active' }).select('_id');
    targetEmployeeIds = allEmployees.map(emp => emp._id);
  }

  if (!targetEmployeeIds || targetEmployeeIds.length === 0) {
    throw new ValidationError("No employees selected for payroll generation");
  }

  const results = { success: [], failed: [] };

  for (const employeeId of targetEmployeeIds) {
    try {
      const structure = await Payroll.findOne({ employee: employeeId, organization: organizationId, isTemplate: true });
      if (!structure) {
        results.failed.push({ 
          employeeId, 
          reason: "Salary structure not set. Please configure salary first." 
        });
        continue;
      }

      // 🚀 INDEPENDENT OF ATTENDANCE & MANUAL OVERRIDE LOGIC
      let baseGross;
      let overrideFactor;

      if (manualAmount && Number(manualAmount) > 0) {
        baseGross = Number(manualAmount);
        overrideFactor = baseGross / structure.grossSalary; 
      } else {
        baseGross = structure.grossSalary;
        overrideFactor = 1;
      }

      // Extra Activities (Project Bonuses, etc.)
      const extras = extraEarnings?.[employeeId] || [];
      const totalExtra = extras.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const finalMonthlyGross = baseGross + totalExtra;

      // Components calculation using overrideFactor
      const monthlyBasic = Math.round(structure.earnings.basic * overrideFactor);
      const monthlyHRA = Math.round(structure.earnings.hra * overrideFactor);
      const monthlyDA = Math.round((structure.earnings.da || 0) * overrideFactor);
      const monthlySpecial = Math.round((structure.earnings.specialAllowance || 0) * overrideFactor); 

      const monthlyCustomEarnings = (structure.customEarnings || []).map(item => ({ ...item, amount: Math.round(item.amount * overrideFactor) }));
      const monthlyCustomDeductions = (structure.customDeductions || []).map(item => ({ ...item, amount: Math.round(item.amount * overrideFactor) }));

      const totalMonthlyCustomEarnings = monthlyCustomEarnings.reduce((sum, item) => sum + item.amount, 0);
      const totalMonthlyCustomDeductions = monthlyCustomDeductions.reduce((sum, item) => sum + item.amount, 0);
      
      // PF Calculation
      const monthlyEpfEmployee = Math.round((structure.deductions.epfEmployee || 0) * overrideFactor);
      const monthlyProfTax = Math.round((structure.deductions.professionalTax || 200) * overrideFactor);
      const monthlyTds = Math.round((structure.deductions.tds || 0) * overrideFactor);

      const monthlySlip = new Payroll({
        organization: organizationId,
        employee: employeeId,
        month: month.toString(),
        year: parseInt(year),
        ctc: structure.ctc,
        grossSalary: finalMonthlyGross + totalMonthlyCustomEarnings,
        earnings: {
          basic: monthlyBasic,
          hra: monthlyHRA,
          da: monthlyDA,
          specialAllowance: monthlySpecial,
          extraActivities: extras
        },
        deductions: {
          epfEmployee: monthlyEpfEmployee,
          professionalTax: monthlyProfTax,
          tds: monthlyTds
        },
        customEarnings: monthlyCustomEarnings,
        customDeductions: monthlyCustomDeductions,
        statutory: structure.statutory,
        netSalary: finalMonthlyGross + totalMonthlyCustomEarnings - (monthlyEpfEmployee + monthlyProfTax + monthlyTds + totalMonthlyCustomDeductions),
        taxRegime: structure.taxRegime,
        isTemplate: false,
        paymentStatus: 'PENDING'
      });

      await monthlySlip.save();
      results.success.push({ employeeId, slipId: monthlySlip._id });
    } catch (err) {
      results.failed.push({ employeeId, reason: err.message });
    }
  }
  
  if (results.success.length === 0 && results.failed.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Payroll generation failed for all selected employees.",
      details: results.failed
    });
  }

  const msg = results.failed.length > 0 
    ? `Generated ${results.success.length} slips, but ${results.failed.length} failed.`
    : "Payroll run completed successfully";

  return successResponse(res, msg, results);
});

// ✅ GET: Unified employee list for payroll selection
const getUnifiedEmployeeList = async (req, res) => {
  try{
    const organizationId = req.organization?._id || req.organization || req.user?.organization;
    logger.info("Fetching unified employee list for payroll", { organizationId });
    const employees = await Employee.find({ organization: organizationId, isActive: true })
      .select('_id name employeeID department role')
      .lean();
    logger.info("Employee list retrieved", { count: employees.length, organizationId, employees});
    return successResponse(res, "Employee list retrieved successfully", employees);

  }
  catch (error) {
    const orgId = req.organization?._id || req.organization || req.user?.organization;
    logger.error("Error fetching employee list for payroll", { error: error.message, organizationId: orgId });
    return res.status(500).json({ success: false, message: "Failed to retrieve employee list" });
  }
  
};

// ✅ GET: Get payroll summary for dashboard
const getPayrollSummary = asyncHandler(async (req, res) => {
    const organizationId = req.organization?._id || req.organization || req.user?.organization;
    const currentMonth = (new Date().getMonth() + 1).toString();
    const currentYear = new Date().getFullYear();

    const allStaff = await Employee.find({ organization: organizationId, isActive: true }).select('name employeeID department role') || [];

    const [structures, currentMonthPayrolls] = await Promise.all([
        Payroll.find({ organization: organizationId, isTemplate: true }).select('employee grossSalary'),
        Payroll.find({ organization: organizationId, month: currentMonth, year: currentYear, isTemplate: false })
    ]);

    const staffWithStatus = allStaff.map(s => {
        const structure = structures.find(st => st.employee?.toString() === s._id.toString());
        const slip = currentMonthPayrolls.find(p => p.employee?.toString() === s._id.toString());
        
        return {
            ...s.toObject(),
            hasStructure: !!structure,
            monthlyGross: structure?.grossSalary || slip?.grossSalary || 0,
            payrollStatus: slip ? slip.paymentStatus : (structure ? "READY" : "NOT_CONFIGURED")
        };
    });

    const paidTotal = currentMonthPayrolls.filter(p => p.paymentStatus === 'PAID').reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const pendingTotal = currentMonthPayrolls.filter(p => p.paymentStatus !== 'PAID').reduce((sum, p) => sum + (p.netSalary || 0), 0);

    return successResponse(res, "Payroll summary retrieved", {
        paid: Math.round(paidTotal),
        pending: Math.round(pendingTotal),
        totalStaff: allStaff.length,
        staffList: staffWithStatus,
        processedCount: currentMonthPayrolls.length
    });
});

// ✅ GET: Get specific employee's payroll structure
const getPayrollStructure = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  const structure = await Payroll.findOne({ employee: employeeId, organization: organizationId, isTemplate: true });

  if (!structure) throw new NotFoundError("Payroll structure not found for this employee");
  return successResponse(res, "Payroll structure retrieved", structure);
});

// ✅ PATCH: Mark payroll as paid
const markPayrollPaid = asyncHandler(async (req, res) => {
  const { slipId } = req.params;
  const { transactionId, paymentMode } = req.body;
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  if (!transactionId) throw new ValidationError("Transaction ID is required");

  const slip = await Payroll.findOneAndUpdate(
    { _id: slipId, organization: organizationId, isTemplate: false },
    {
      paymentStatus: 'PAID',
      paymentDate: new Date(),
      transactionId: transactionId.toUpperCase(),
      paymentMode: paymentMode || 'NEFT',
      updatedAt: new Date()
    },
    { returnDocument: 'after', runValidators: true }
  );

  if (!slip) throw new NotFoundError("Payroll slip not found");

  try {
    const io = getIO();
    io.to(slip.employee.toString()).emit("new_notification", {
      title: "Salary Paid 💰",
      message: `Your salary has been paid via ${paymentMode || 'NEFT'}.`,
      priority: "high"
    });
  } catch (err) {
    logger.error("Socket emit failed", err);
  }

  return successResponse(res, "Payment status updated to PAID", slip);
});

// ✅ POST: Update company payroll policy
const updateCompanyPayrollPolicy = asyncHandler(async (req, res) => {
    const { basicPercent, hraPercent, daPercent } = req.body;
    const organizationId = req.organization?._id || req.organization || req.user?.organization;

    const policy = await CompanyPolicy.findOneAndUpdate(
        { companyId: organizationId },
        { payrollSettings: { basicPercent: Number(basicPercent), hraPercent: Number(hraPercent), daPercent: Number(daPercent) } },
        { upsert: true, returnDocument: 'after' }
    );

    return successResponse(res, "Company policy updated", policy);
});

// ✅ GET: Fetch company payroll policy
const getCompanyPayrollPolicy = asyncHandler(async (req, res) => {
    const organizationId = req.organization?._id || req.organization || req.user?.organization;
    const policy = await CompanyPolicy.findOne({ companyId: organizationId });
    
    const defaultSettings = {
        payrollSettings: { basicPercent: 50, hraPercent: 20, daPercent: 10 }
    };
    return successResponse(res, "Policy retrieved", policy || defaultSettings);
});

// ✅ GET: Get monthly payroll list
const getMonthlyPayroll = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  if (!month || !year) throw new ValidationError("Month and Year are required");

  const payrolls = await Payroll.find({
    organization: new mongoose.Types.ObjectId(organizationId),
    month: month.toString(),
    year: parseInt(year),
    isTemplate: false
  }).sort({ createdAt: -1 }).lean();

  const enrichedPayrolls = await Promise.all(payrolls.map(async (payroll) => {
    logger.info("Enriching payroll slip with employee details", { payrollId: payroll._id, employeeId: payroll.employee._id });
    const staff = await Employee.findById(payroll.employee._id).select('name employeeID');
    logger.info("Enriching payroll slip with employee details", {staff });
    return {
      ...payroll,
      employeeName: staff?.name || "Unknown Employee",
      employeeCode: staff?.employeeID || "N/A"
    };
  }));

  return successResponse(res, "Payroll list retrieved", enrichedPayrolls);
});

// ✅ DELETE: Delete draft payroll
const deleteDraftPayroll = asyncHandler(async (req, res) => {
  const { payrollId } = req.params;
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  const deleted = await Payroll.findOneAndDelete({ _id: payrollId, organization: organizationId, paymentStatus: 'PENDING', isTemplate: false });
  if (!deleted) throw new NotFoundError("Draft payroll not found or cannot be deleted");

  return successResponse(res, "Draft payroll deleted successfully", deleted);
});

// ✅ GET: Get single payroll slip details for View/PDF
const getPayrollDetails = asyncHandler(async (req, res) => {
  const { slipId } = req.params;
  const organizationId = req.organization?._id || req.organization || req.user?.organization;

  const slip = await Payroll.findOne({ _id: slipId, organization: organizationId }).lean();
  if (!slip) throw new NotFoundError("Salary slip not found");

  const staff = await Employee.findById(slip.employee).select('name employeeID department phone panNumber salary email');
  if (!staff) throw new NotFoundError("Employee record not found");

  return successResponse(res, "Slip details retrieved", { slip, staff });
});

// ✅ GET: Download salary slip as PDF (Corporate standard)
// const downloadSalarySlip = asyncHandler(async (req, res) => {
//     const { slipId } = req.params;
//     const organizationId = req.organization?._id || req.organization || req.user?.organization;
//     const monthNames = [ "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER" ];

//     const slip = await Payroll.findOne({ _id: slipId, organization: organizationId }).lean();
//     if (!slip) throw new NotFoundError("Salary slip not found");

//     const staff = await Employee.findById(slip.employee).select('name employeeID department panNumber salary email');
//     if (!staff) throw new NotFoundError("Employee member not found");

//     const company = await Company.findById(organizationId).lean(); 
//     const displayMonth = isNaN(slip.month) ? slip.month : monthNames[parseInt(slip.month) - 1];

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=SalarySlip_${staff.name.replace(/\s+/g, '_')}_${displayMonth}.pdf`);

//     const doc = new PDFDocument({ size: 'A4', margin: 50 });
//     doc.pipe(res);

//    const drawTableRow = (doc, y, col1, col2, col3, col4) => {
//   doc.fontSize(10).font("Helvetica")
//     .text(col1, 60, y)
//     .text(col2, 200, y, { width: 90, align: "right" })
//     .text(col3, 320, y)
//     .text(col4, 450, y, { width: 90, align: "right" });
// };

// const drawLine = (doc, y) => {
//   doc.moveTo(50, y).lineTo(550, y).stroke("#e5e7eb");
// };

// try {
//   // ================= HEADER =================
//   doc.fillColor("#1e3a8a")
//     .fontSize(18)
//     .font("Helvetica-Bold")
//     .text(company?.companyName?.toUpperCase() || "COMPANY NAME", { align: "center" });

//   doc.fillColor("#64748b")
//     .fontSize(10)
//     .font("Helvetica")
//     .text(company?.address?.city || "", { align: "center" });

//   doc.moveDown(1.5);

//   doc.fillColor("#000")
//     .fontSize(14)
//     .font("Helvetica-Bold")
//     .text(`PAYSLIP FOR ${displayMonth} ${slip.year}`, { align: "center" });

//   doc.moveDown(2);

//   // ================= EMPLOYEE DETAILS =================
//   doc.fontSize(10).font("Helvetica-Bold");
//   doc.text("Employee Name:", 50, doc.y);
//   doc.text("Employee ID:", 50, doc.y + 15);
//   doc.text("Department:", 50, doc.y + 30);

//   doc.font("Helvetica");
//   doc.text(staff.name, 150, doc.y - 30);
//   doc.text(staff.employeeID, 150, doc.y - 15);
//   doc.text(staff.department || "N/A", 150, doc.y);

//   doc.text("PAN:", 320, doc.y - 30);
//   doc.text("Bank A/c:", 320, doc.y - 15);
//   doc.text("Regime:", 320, doc.y);

//   doc.text(staff.panNumber || "N/A", 420, doc.y - 30);
//   doc.text(staff.salary?.bankDetails?.accountNumber || "N/A", 420, doc.y - 15);
//   doc.text(slip.taxRegime || "NEW", 420, doc.y);

//   doc.moveDown(3);

//   // ================= TABLE HEADER =================
//   doc.font("Helvetica-Bold").fontSize(11);
//   drawTableRow(doc, doc.y, "Earnings", "Amount", "Deductions", "Amount");

//   drawLine(doc, doc.y + 15);

//   let y = doc.y + 25;

//   const earnings = slip.earnings || {};
//   const deductions = slip.deductions || {};

//   const earningKeys = [
//     ["Basic", earnings.basic],
//     ["HRA", earnings.hra],
//     ["DA", earnings.da],
//     ["Special Allowance", earnings.specialAllowance],
//     ["Bonus", earnings.bonus],
//   ];

//   const deductionKeys = [
//     ["EPF", deductions.epfEmployee],
//     ["Professional Tax", deductions.professionalTax],
//     ["TDS", deductions.tds],
//     ["Other", deductions.otherDeductions],
//   ];

//   const maxRows = Math.max(earningKeys.length, deductionKeys.length);

//   for (let i = 0; i < maxRows; i++) {
//     const e = earningKeys[i] || ["", ""];
//     const d = deductionKeys[i] || ["", ""];

//     drawTableRow(
//       doc,
//       y,
//       e[0],
//       e[1] ? `₹ ${e[1]}` : "",
//       d[0],
//       d[1] ? `₹ ${d[1]}` : ""
//     );

//     y += 20;
//   }

//   drawLine(doc, y);

//   // ================= TOTALS =================
//   y += 10;

//   doc.font("Helvetica-Bold");

//   doc.text("Gross Salary:", 50, y);
//   doc.text(`₹ ${slip.grossSalary}`, 200, y, { align: "right" });

//   doc.text("Total Deductions:", 320, y);
//   const totalDeduction =
//     (deductions.epfEmployee || 0) +
//     (deductions.professionalTax || 0) +
//     (deductions.tds || 0) +
//     (deductions.otherDeductions || 0);

//   doc.text(`₹ ${totalDeduction}`, 450, y, { align: "right" });

//   y += 25;

//   doc.fontSize(12).fillColor("#16a34a");

//   doc.text("Net Salary:", 50, y);
//   doc.text(`₹ ${slip.netSalary}`, 450, y, { align: "right" });

//   // ================= FOOTER =================
//   doc.moveDown(3);

//   doc.fillColor("#6b7280")
//     .fontSize(9)
//     .text(
//       "This is a system-generated payslip and does not require a signature.",
//       { align: "center" }
//     );

// } catch (error) {
//   console.error("PDF Error:", error);
// }
//     doc.end();
// });

const downloadSalarySlip = asyncHandler(async (req, res) => {
  const { slipId } = req.params;

  const organizationId =
    req.organization?._id ||
    req.organization ||
    req.user?.organization;

  const monthNames = [
    "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
    "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
  ];

  const slip = await Payroll.findOne({
    _id: slipId,
    organization: organizationId,
  }).lean();

  if (!slip) throw new NotFoundError("Salary slip not found");

  const staff = await Employee.findById(slip.employee).select(
    "name employeeID department panNumber salary email"
  );

  if (!staff) throw new NotFoundError("Employee not found");

  const company = await Company.findById(organizationId).lean();

  const displayMonth = isNaN(slip.month)
    ? slip.month
    : monthNames[parseInt(slip.month) - 1];

  // ================= RESPONSE HEADERS =================
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=SalarySlip_${staff.name.replace(/\s+/g, "_")}_${displayMonth}.pdf`
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  // ================= HELPER =================
  const formatINR = (num) => {
    if (!num) return "";
    return "₹ " + new Intl.NumberFormat("en-IN").format(num);
  };

  const drawLine = (y) => {
    doc.moveTo(50, y).lineTo(550, y).stroke("#e5e7eb");
  };

  const drawRow = (y, eLabel, eVal, dLabel, dVal) => {
    doc.font("Helvetica")
      .text(eLabel, 60, y)
      .text(formatINR(eVal), 200, y, { width: 100, align: "right" })
      .text(dLabel, 320, y)
      .text(formatINR(dVal), 450, y, { width: 100, align: "right" });
  };

  try {
    // ================= HEADER =================
    doc
      .fillColor("#1e3a8a")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(company?.companyName?.toUpperCase() || "COMPANY NAME", {
        align: "center",
      });

    doc
      .fillColor("#64748b")
      .fontSize(10)
      .font("Helvetica")
      .text(company?.address?.city || "", { align: "center" });

    doc.moveDown(1.5);

    doc
      .fillColor("#000")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`PAYSLIP FOR ${displayMonth} ${slip.year}`, {
        align: "center",
      });

    doc.moveDown(2);

    // ================= EMPLOYEE DETAILS =================
    const startY = doc.y;

    doc.font("Helvetica-Bold").fontSize(10);

    doc.text("Employee Name:", 50, startY);
    doc.text("Employee ID:", 50, startY + 15);
    doc.text("Department:", 50, startY + 30);

    doc.font("Helvetica");

    doc.text(staff.name || "N/A", 150, startY);
    doc.text(staff.employeeID || "N/A", 150, startY + 15);
    doc.text(staff.department || "N/A", 150, startY + 30);

    doc.font("Helvetica-Bold");

    doc.text("PAN:", 320, startY);
    doc.text("Bank A/c:", 320, startY + 15);
    doc.text("Regime:", 320, startY + 30);

    doc.font("Helvetica");

    doc.text(staff.panNumber || "N/A", 420, startY);
    doc.text(
      staff.salary?.bankDetails?.accountNumber || "N/A",
      420,
      startY + 15
    );
    doc.text(slip.taxRegime || "NEW", 420, startY + 30);

    doc.moveDown(4);

    // ================= TABLE HEADER =================
    doc.font("Helvetica-Bold").fontSize(11);

    drawRow(doc.y, "Earnings", "Amount", "Deductions", "Amount");

    drawLine(doc.y + 15);

    let y = doc.y + 25;

    const earnings = [
      ["Basic", slip.earnings?.basic],
      ["HRA", slip.earnings?.hra],
      ["DA", slip.earnings?.da],
      ["Special Allowance", slip.earnings?.specialAllowance],
      ["Bonus", slip.earnings?.bonus],
    ];
    (slip.customEarnings || []).forEach(item => earnings.push([item.label, item.amount]));

    const deductions = [
      ["EPF", slip.deductions?.epfEmployee],
      ["Professional Tax", slip.deductions?.professionalTax],
      ["TDS", slip.deductions?.tds],
      ["Other", slip.deductions?.otherDeductions],
    ];
    (slip.customDeductions || []).forEach(item => deductions.push([item.label, item.amount]));

    const maxRows = Math.max(earnings.length, deductions.length);

    for (let i = 0; i < maxRows; i++) {
      const e = earnings[i] || ["", ""];
      const d = deductions[i] || ["", ""];

      drawRow(y, e[0], e[1], d[0], d[1]);
      y += 20;
    }

    drawLine(y);

    // ================= TOTALS =================
    y += 10;

    const totalDeduction =
      (slip.deductions?.epfEmployee || 0) +
      (slip.deductions?.professionalTax || 0) +
      (slip.deductions?.tds || 0) +
      (slip.deductions?.otherDeductions || 0) +
      (slip.customDeductions || []).reduce((sum, d) => sum + d.amount, 0);

    doc.font("Helvetica-Bold");

    doc.text("Gross Salary:", 50, y);
    doc.text(formatINR(slip.grossSalary), 200, y, {
      width: 100,
      align: "right",
    });

    doc.text("Total Deductions:", 320, y);
    doc.text(formatINR(totalDeduction), 450, y, {
      width: 100,
      align: "right",
    });

    y += 25;

    doc.fillColor("#16a34a").fontSize(12);

    doc.text("Net Salary:", 50, y);
    doc.text(formatINR(slip.netSalary), 450, y, {
      width: 100,
      align: "right",
    });

    // ================= FOOTER =================
    doc.moveDown(4);

    doc
      .fillColor("#6b7280")
      .fontSize(9)
      .text(
        "This is a system-generated payslip and does not require a signature.",
        { align: "center" }
      );

  } catch (error) {
    console.error("PDF generation error:", error);
  }

  doc.end();
});

// ✅ GET: View logged-in user's salary history
const getMySalaryHistory = asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    const organizationId = req.organization?._id || req.organization || req.user?.organization;

    const history = await Payroll.find({ employee: userId, organization: organizationId, isTemplate: false }).sort({ year: -1, month: -1 });
    return successResponse(res, "Your salary history retrieved", history);
});

module.exports = {
  getEmployeePayrollStats,
  calculateAndSetSalary,
  runMonthlyPayroll,
  getUnifiedEmployeeList,
  getPayrollSummary,
  getPayrollStructure,
  markPayrollPaid,
  getMonthlyPayroll,
  deleteDraftPayroll,
  getPayrollDetails,
  downloadSalarySlip,
  getMySalaryHistory,
  updateCompanyPayrollPolicy,
  getCompanyPayrollPolicy
};