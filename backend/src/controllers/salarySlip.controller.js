const Payroll = require('../models/Payroll.model.js');
const { successResponse } = require('../utils/response.js');
const { asyncHandler } = require('../middlewares/error.middleware.js');
const { NotFoundError, ForbiddenError } = require('../utils/errors.js');
const PDFDocument = require('pdfkit');

/**
 * Formats a payroll document into a clean salary slip object.
 * @param {object} payroll - The Mongoose payroll document.
 * @returns {object} A formatted salary slip.
 */
const formatSalarySlip = (payroll) => {
  if (!payroll) return null;

  return {
    _id: payroll._id,
    employeeName: payroll.employee?.name || 'N/A',
    designation: payroll.employee?.designation || 'Employee',
    month: new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' }),
    year: payroll.year,
    basicSalary: payroll.basicSalary,
    allowances: payroll.allowances,
    bonus: payroll.bonus,
    deductions: payroll.deductions,
    netSalary: payroll.netSalary,
    status: payroll.status,
    paidAt: payroll.paidAt ? new Date(payroll.paidAt).toLocaleDateString('en-IN') : 'N/A',
    organizationName: payroll.organization?.companyName || 'Your Company',
    organizationLogo: payroll.organization?.logoUrl || null, // Assuming logo URL is stored in Organization model
  };
};

/**
 * Controller 1: Get Salary Slip by ID (JSON)
 */
const getSalarySlipById = asyncHandler(async (req, res) => {
  const { payrollId } = req.params;
  const orgId = req.organization._id;
  const user = req.user;

  const payroll = await Payroll.findOne({ _id: payrollId, organization: orgId })
    .populate('employee', 'name designation')
    .populate('organization', 'companyName logoUrl')
    .lean();

  if (!payroll) {
    throw new NotFoundError('Salary slip not found');
  }

  // Role-based access control
  if (user.role === 'member' && payroll.employee._id.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to view this salary slip.');
  }

  const formattedSlip = formatSalarySlip(payroll);
  return successResponse(res, 'Salary slip retrieved successfully', formattedSlip);
});

/**
 * Controller 2: Download Salary Slip as PDF
 */
const downloadSalarySlipPDF = asyncHandler(async (req, res) => {
  const { payrollId } = req.params;
  const orgId = req.organization._id;
  const user = req.user;

  const payroll = await Payroll.findOne({ _id: payrollId, organization: orgId })
    .populate('employee', 'name designation employeeId')
    .populate('organization', 'companyName logoUrl')
    .lean();

  if (!payroll) {
    throw new NotFoundError('Salary slip not found');
  }

  // Role-based access control
  if (user.role === 'member' && payroll.employee._id.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to download this salary slip.');
  }

  const slip = formatSalarySlip(payroll);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="payslip-${slip.month}-${slip.year}-${slip.employeeName}.pdf"`);

  doc.pipe(res);

  // --- PDF Content ---
  // Header with Logo placeholder
  // To use a real logo, you would fetch it and use doc.image()
  doc.fontSize(20).font('Helvetica-Bold').text(slip.organizationName, { align: 'center' });
  doc.fontSize(14).font('Helvetica').text(`Salary Slip for ${slip.month} ${slip.year}`, { align: 'center' });
  doc.moveDown(2);

  // Employee Details
  doc.fontSize(12).font('Helvetica-Bold').text('Employee Details');
  doc.font('Helvetica').text(`Name: ${slip.employeeName}`);
  doc.text(`Designation: ${slip.designation}`);
  doc.moveDown();

  // Salary Breakdown Table
  const tableTop = doc.y;
  const itemX = 50;
  const descriptionX = 60;
  const amountX = 450;

  const drawRow = (y, item, amount) => {
    doc.fontSize(10).font('Helvetica').text(item, descriptionX, y);
    doc.text(`₹ ${amount.toLocaleString()}`, amountX, y, { align: 'right' });
  };

  const drawLine = (y) => {
    doc.strokeColor("#aaaaaa").lineWidth(0.5).moveTo(itemX, y).lineTo(550, y).stroke();
  };

  // Earnings
  doc.fontSize(11).font('Helvetica-Bold').text('Earnings', itemX, tableTop);
  doc.moveDown(0.5);
  let currentY = doc.y;
  drawLine(currentY);
  currentY += 15;
  // drawRow(currentY, 'Basic Salary', slip.basicSalary);
  // currentY += 20;
  // drawRow(currentY, 'Allowances', slip.allowances);
  // currentY += 20;
  // drawRow(currentY, 'Bonus', slip.bonus);
  // currentY += 20;
  drawRow(currentY, 'Basic Salary', payroll.earnings.basic);

currentY += 20;
drawRow(currentY, 'Dearness Allowance', payroll.earnings.da);

currentY += 20;
drawRow(currentY, 'HRA', payroll.earnings.hra);

currentY += 20;
drawRow(currentY, 'Special Allowance', payroll.earnings.specialAllowance);
  drawLine(currentY);
  currentY += 10;
  // const grossSalary = slip.basicSalary + slip.allowances + slip.bonus;
  const grossSalary =
  payroll.earnings.basic +
  payroll.earnings.da +
  payroll.earnings.hra +
  payroll.earnings.specialAllowance;
  doc.font('Helvetica-Bold').text('Gross Earnings', descriptionX, currentY);
  doc.text(`₹ ${grossSalary.toLocaleString()}`, amountX, currentY, { align: 'right' });
  currentY += 25;

  // Deductions
  doc.fontSize(11).font('Helvetica-Bold').text('Deductions', itemX, currentY);
  doc.moveDown(0.5);
  currentY = doc.y;
  drawLine(currentY);
  currentY += 15;
  // drawRow(currentY, 'Standard Deductions', slip.deductions);
  drawRow(currentY, 'EPF', payroll.deductions.epfEmployee);

currentY += 20;
drawRow(currentY, 'Professional Tax', payroll.deductions.professionalTax);

currentY += 20;
drawRow(currentY, 'TDS', payroll.deductions.tds);
  currentY += 20;
  drawLine(currentY);
  currentY += 10;
  const totalDeductions =
  payroll.deductions.epfEmployee +
  payroll.deductions.professionalTax +
  payroll.deductions.tds;
  doc.font('Helvetica-Bold').text('Total Deductions', descriptionX, currentY);
  doc.text(`₹ ${totalDeductions.toLocaleString()}`, amountX, currentY, { align: 'right' });
  currentY += 30;

  // Net Salary
  drawLine(currentY);
  currentY += 10;
  doc.font('Helvetica-Bold').fontSize(12).text('Net Salary', descriptionX, currentY);
  doc.text(`₹ ${slip.netSalary.toLocaleString()}`, amountX, currentY, { align: 'right' });
  currentY += 20;
  drawLine(currentY);
  doc.moveDown(3);

  // Status
  doc.fontSize(10).font('Helvetica-Oblique').text(`Status: ${slip.status} | Paid On: ${slip.paidAt}`, { align: 'right' });

  // Footer
  doc.fontSize(8).text('This is a computer-generated salary slip and does not require a signature.', 50, 750, { align: 'center', lineBreak: false });

  // --- End PDF ---
  doc.end();
});

/**
 * Controller 3: Get My Salary Slips (Employee)
 */
const getMySalarySlips = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const orgId = req.organization._id;
  const { month, year, page = 1, limit = 10 } = req.query;

  const filter = { organization: orgId, employee: userId };
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  const skip = (Number(page) - 1) * Number(limit);

  const payrolls = await Payroll.find(filter)
    .populate('organization', 'companyName')
    .populate('employee', 'name designation')
    .sort({ year: -1, month: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Payroll.countDocuments(filter);
  const formattedSlips = payrolls.map(formatSalarySlip);

  return successResponse(res, 'My salary slips retrieved successfully', {
    slips: formattedSlips,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Controller 4: Get All Salary Slips (Admin)
 */
const getAllSalarySlips = asyncHandler(async (req, res) => {
  const orgId = req.organization._id;
  const { month, year, employeeId, status, page = 1, limit = 10 } = req.query;

  const filter = { organization: orgId };
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  if (employeeId) filter.employee = employeeId;
  if (status) filter.status = status.toUpperCase();

  const skip = (Number(page) - 1) * Number(limit);

  const payrolls = await Payroll.find(filter)
    .populate('organization', 'companyName')
    .populate('employee', 'name designation')
    .sort({ year: -1, month: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Payroll.countDocuments(filter);
  const formattedSlips = payrolls.map(formatSalarySlip);

  return successResponse(res, 'All salary slips retrieved successfully', {
    slips: formattedSlips,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  getSalarySlipById,
  downloadSalarySlipPDF,
  getMySalarySlips,
  getAllSalarySlips,
};