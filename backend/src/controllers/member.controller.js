// const chalk = require("chalk");

const User = require("../models/User.model");
const Activity = require('../models/Activity');
const inviteService = require("../services/invite.service");
const { getIO } = require("../services/socket.service.js");
const logger = require("../common/libs/logger");

// Safe Chalk Import (Handles ESM/CJS mismatch or missing package)
let chalk;
try {
  chalk = require("chalk");
  if (typeof chalk.red !== "function") throw new Error("Chalk not loaded");
} catch (e) {
  const identity = (str) => str;
  chalk = {
    cyan: identity,
    green: identity,
    yellow: identity,
    red: identity,
    blue: identity,
    white: identity,
    gray: identity,
    bgRed: identity,
  };
}


// ------------------------------------------------
// CREATE EMPLOYEE
// ------------------------------------------------

exports.createEmployee = async (req, res) => {
  try {
    logger.info(" employee request received", req.body);

    const {
      // Personal
      name, email, password, phone, gender, dateOfBirth, currentAddress, permanentAddress, imageUrl,
      // Emergency
      emergencyName, emergencyPhone, emergencyRelation,
      // Identity
      aadhaar, pan, passport,
      // Employment
      role, designation, department, customDepartment, joiningDate, previousCompany,
      // Financial
      bankName, accountNumber, ifscCode
    } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const organization = req.organization._id;
    const normalizedEmail = email.trim().toLowerCase();

    logger.info("Create employee request", { 
      email: normalizedEmail,
      organization
    });

    const existing = await User.findOne({
      email: normalizedEmail,
      organization
    });

    if (existing) {
      logger.warn("Employee already exists", { email: normalizedEmail });
      return res.status(400).json({
        message: "Employee with this email already exists"
      });
    }

    const departmentCodes = {
      sales: "SAL",
      marketing: "MKT",
      "customer-support": "CSR",
      it: "IT",
      "human-resource and administration": "HR",
      "human-resource": "HR",
      hr: "HR",
      engineering: "ENG",
      finance: "FIN",
      operations: "OPS",
    };

    const cleanDept = department?.trim() || "";
    const cleanCustomDept = customDepartment?.trim() || "";

    let deptCode = "EMP";
    if (cleanDept.toLowerCase() === "other" && cleanCustomDept) {
      deptCode = cleanCustomDept.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "OTH";
    } else if (cleanDept && departmentCodes[cleanDept.toLowerCase()]) {
      deptCode = departmentCodes[cleanDept.toLowerCase()];
    } else if (cleanDept) {
      deptCode = cleanDept.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "EMP";
    }

    const count = await User.countDocuments({ organization });
    let employeeId;
    let suffix = count + 1;
    do {
      employeeId = `${deptCode}-${String(suffix).padStart(3, "0")}`;
      const exists = await User.findOne({ organization, employeeId });
      if (!exists) break;
      suffix++;
    } while (true);

    // Sanitize optional fields to avoid empty string cast errors & unique constraint collisions
    const cleanAadhaar = aadhaar && String(aadhaar).trim() ? String(aadhaar).trim() : undefined;
    const cleanPan = pan && String(pan).trim() ? String(pan).trim().toUpperCase() : undefined;
    const cleanPassport = passport && String(passport).trim() ? String(passport).trim() : undefined;
    const cleanDob = dateOfBirth && String(dateOfBirth).trim() ? new Date(dateOfBirth) : undefined;
    const cleanJoiningDate = joiningDate && String(joiningDate).trim() ? new Date(joiningDate) : undefined;
    const cleanGender = gender && String(gender).trim() ? String(gender).trim() : undefined;

    // Normalize role
    let userRole = (role || "employee").toLowerCase();
    if (userRole === "member") {
      userRole = "employee";
    }

    const userPayload = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone && String(phone).trim() ? String(phone).trim() : undefined,
      gender: cleanGender,
      dateOfBirth: cleanDob,
      currentAddress: currentAddress && String(currentAddress).trim() ? String(currentAddress).trim() : undefined,
      permanentAddress: permanentAddress && String(permanentAddress).trim() ? String(permanentAddress).trim() : undefined,
      imageUrl: imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : undefined,
      emergencyName: emergencyName && String(emergencyName).trim() ? String(emergencyName).trim() : undefined,
      emergencyPhone: emergencyPhone && String(emergencyPhone).trim() ? String(emergencyPhone).trim() : undefined,
      emergencyRelation: emergencyRelation && String(emergencyRelation).trim() ? String(emergencyRelation).trim() : undefined,
      role: userRole,
      employeeId,
      designation: designation && String(designation).trim() ? String(designation).trim() : undefined,
      department: cleanDept,
      customDepartment: cleanCustomDept,
      joiningDate: cleanJoiningDate,
      previousCompany: previousCompany && String(previousCompany).trim() ? String(previousCompany).trim() : undefined,
      bankName: bankName && String(bankName).trim() ? String(bankName).trim() : undefined,
      accountNumber: accountNumber && String(accountNumber).trim() ? String(accountNumber).trim() : undefined,
      ifscCode: ifscCode && String(ifscCode).trim() ? String(ifscCode).trim().toUpperCase() : undefined,
      organization
    };

    if (cleanAadhaar) userPayload.aadhaar = cleanAadhaar;
    if (cleanPan) userPayload.pan = cleanPan;
    if (cleanPassport) userPayload.passport = cleanPassport;

    const user = await User.create(userPayload);

    logger.info("Employee created", {
      userId: user._id,
      organization,
      employeeId: user.employeeId
    });

    console.log(
      chalk.green(`✔ Employee created → ${user._id}`)
    );

    // Activity Log
    try {
      await Activity.create({
        organization: organization, 
        user: req.user?.userId || req.user?._id,
        action: "Member Added",
        message: `Added a new member: ${user.name}`,
        referenceId: user._id,
        referenceModel: "User"
      });
    } catch (actErr) {
      logger.error("Failed to log activity for employee creation", actErr?.message);
    }

    // Socket notification
    try {
      const io = getIO();
      const currentActorId = req.user?.userId || req.user?._id;
      const admins = await User.find({ 
        organization, 
        role: { $in: ['admin', 'owner', 'manager'] }, 
        _id: { $ne: currentActorId } 
      });
      
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit('new_notification', {
          title: "New Member Added",
          message: `A new member, ${user.name}, has been added.`,
          priority: "normal"
        });
      });
    } catch (err) {
      logger.error("Socket emit failed for member creation", err?.message);
    }

    res.status(201).json(user);

  } catch (error) {
    logger.error("Create employee failed", {
      error: error.message
    });
    console.error("Create employee error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(400).json({
        message: `An employee with this ${field} already exists.`,
        error: error.message
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
        error: error.message
      });
    }

    res.status(500).json({
      message: error.message || "Server error",
      error: error.message
    });
  }
};



// ------------------------------------------------
// INVITE EMPLOYEE
// ------------------------------------------------

exports.inviteEmployee = async (req, res) => {

  try {

    const { email } = req.body;

    const organizationId = req.organization._id;

    logger.info("Invite employee request", {
      email,
      organizationId
    });

    const token = await inviteService.createInvite(
      email,
      organizationId
    );

    const inviteUrl =
      `${process.env.APP_URL}/invite/${token}`;

    console.log(
      chalk.blue(`📨 Invite created → ${inviteUrl}`)
    );

    res.json({
      message: "Invite generated",
      inviteUrl
    });

  } catch (error) {

    logger.error("Invite employee failed", {
      error: error.message
    });

    res.status(500).json({
      message: "Server error"
    });

  }

};



// ------------------------------------------------
// UPDATE ROLE
// ------------------------------------------------

exports.updateRole = async (req, res) => {

  try {

    const { role } = req.body;

    const { userId } = req.params;

    const organization = req.organization._id;

    logger.info("Update role request", {
      userId,
      role
    });

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        organization
      },
      { role },
      { new: true }
    );

    if (!user) {

      logger.warn("User not found for role update", {
        userId
      });

      return res.status(404).json({
        message: "User not found"
      });

    }

    console.log(
      chalk.yellow(`⚙ Role updated → ${user.email} → ${role}`)
    );

    await Activity.findOneAndUpdate(
      { referenceId: userId, referenceModel: "User" },
      {
        action: "Role Updated",
        message: `Updated role for ${user.name || user.email} to ${role}`
      }
    );

    res.json(user);

  } catch (error) {

    logger.error("Update role failed", {
      error: error.message
    });

    res.status(500).json({
      message: "Server error"
    });

  }

};



// ------------------------------------------------
// DEACTIVATE EMPLOYEE
// ------------------------------------------------

exports.deactivateEmployee = async (req, res) => {

  try {

    const { userId } = req.params;

    const organization = req.organization._id;

    logger.info("Deactivate employee request", {
      userId
    });

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        organization
      },
      { status: 'inactive' },
      { new: true }
    );

    if (!user) {

      logger.warn("User not found for deactivate", {
        userId
      });

      return res.status(404).json({
        message: "User not found"
      });

    }

    console.log(
      chalk.red(`⛔ Employee deactivated → ${user.email}`)
    );

    await Activity.findOneAndUpdate(
      { referenceId: userId, referenceModel: "User" },
      {
        action: "Member Deactivated",
        message: `Deactivated member: ${user.name || user.email}`
      }
    );

    res.json({
      message: "Employee deactivated"
    });

  } catch (error) {

    logger.error("Deactivate employee failed", {
      error: error.message
    });

    res.status(500).json({
      message: "Server error"
    });

  }

};



// ------------------------------------------------ 
// GET MEMBERS
// ------------------------------------------------
exports.getEmployees = async (req, res) => {
  try {
    const organization = req.organization._id;

    logger.info("Get employees request", { organization });

    const employees = await User.find({ organization }).select("-password");

    // return consistent object
    res.json({ users: employees });
  } catch (error) {
    logger.error("Get employees failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMembers = async (req, res) => {
  try{
    const organizationId = req.organization._id;

    logger.info("Get members request", {
      organizationId
    });
    const members = await User.find({
      organization: organizationId,
    });
    
    logger.info("Members retrieved", {
      count: members.length
    });

    res.json({
      message: "Members retrieved successfully",
      members,
      count: members.length
    });

    
  }catch(error){
    logger.error("Get members failed", {
      error: error.message
    });

    res.status(500).json({
      message: "Server error"
    });
    
    
  }
}

// ------------------------------------------------
// Call by ID EMPLOYEE
// ------------------------------------------------
 exports.getEmployeeById = async (req, res) => {

  try { 
    const { userId } = req.params;

    const organization = req.organization._id;

    if (!userId) {

      logger.warn("User ID not provided for get by ID");

      return res.status(400).json({
        message: "User ID not provided"
      });

    }

    if(!organization){

      logger.warn("Organization not found for get by ID");  
      return res.status(400).json({
        message: "Organization not found"
      });
    }
  

    logger.info("Get employee by ID request", {
      userId
    });
    const user = await User.findOne({
      _id: userId,
      organization
    });
    if (!user) {
      logger.warn("User not found for ID", {
        userId    });
      return res.status(404).json({
        message: "User not found"
      });
    }
    logger.info("Employee retrieved by ID", {
      userId,
      email: user.email
    });
    res.json({
      message: "Employee retrieved successfully",
      user});
  }
  catch (error) {
    logger.error("Get employee by ID failed", {
      error: error.message
    });
    res.status(500).json({
      message: "Server error"
    });

  }
 }


// --------------------------------------------------
// Delete EMPLOYEE
// ------------------------------------------------

exports.deleteEmployee = async (req, res) => {
  try{
    const { userId } = req.params;
    const organization = req.organization._id;
    if (!userId) {
      logger.warn("User ID not provided for delete");
      return res.status(400).json({
        message: "User ID not provided"
      });
    }
    if(!organization){
      logger.warn("Organization not found for delete");  
      return res.status(400).json({
        message: "Organization not found"
      });
    }
    logger.info("Delete employee request", {
      userId
    });
    const user = await User.findOneAndDelete({
      _id: userId,
      organization
    });
    
    if (!user) {
      logger.warn("User not found for delete", {
        userId
      });
      return res.status(404).json({
        message: "User not found"
      });
    }
    logger.info("Employee deleted", {
      userId,
      email: user.email
    });
    console.log(
      chalk.red(`⛔ Employee deleted → ${user.email}`)
    );

    await Activity.deleteMany({ referenceId: userId, referenceModel: "User" });

    res.json({
      message: "Employee deleted"
    });


  } 
  catch (error){
      logger.error("Delete employee failed", {
      error: error.message
    });
    res.status(500).json({
      message: "Delete employee failed"
    });
  
  }
}

exports.updateEmployee = async (req, res) => {
  try{
    const { userId } = req.params;
    const {
      name, email, phone, gender, dateOfBirth, currentAddress, permanentAddress,imageUrl,
      emergencyName, emergencyPhone, emergencyRelation,status,
      aadhaar, pan, passport,
      role, designation, department, joiningDate, previousCompany,
      bankName, accountNumber, ifscCode
    } = req.body;
    const organization = req.organization._id;
    if (!userId) {
      logger.warn("User ID not provided for update");
      return res.status(400).json({
        message: "User ID not provided"
      });
    }
    if(!organization){
      logger.warn("Organization not found for update");  
      return res.status(400).json({
        message: "Organization not found"
      });
    }
    logger.info("Update employee request", {
      userId
    });
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        organization
      },
      {
        name, email, phone, gender, dateOfBirth, currentAddress, permanentAddress,imageUrl,
        emergencyName, emergencyPhone, emergencyRelation,status,
        aadhaar, pan, passport,
        role, designation, department, joiningDate, previousCompany,
        bankName, accountNumber, ifscCode
      },
      { new: true }
    );
    if (!user) {
      logger.warn("User not found for update", {
        userId
      });
      return res.status(404).json({
        message: "User not found"
      });
    }
    logger.info("Employee updated", {
      userId,
      email: user.email
    });
    console.log(
      chalk.yellow(`⚙ Employee updated → ${user.email}`)
    );

    await Activity.findOneAndUpdate(
      { referenceId: userId, referenceModel: "User" },
      {
        action: "Member Updated",
        message: `Updated member: ${user.name || user.email}`
      }
    );

    res.json({
      message: "Employee updated",
      user
    });
  

  } catch(error){
    logger.error("Update employee failed", {
      error: error.message
    });
    res.status(500).json({
      message: "Server error"
    });
  
  }
}

// ------------------------------------------------
// GET EMPLOYEES
// ------------------------------------------------
exports.getEmployees = async (req, res) => {
  try {
    const organization = req.organization._id;

    logger.info("Get employees request", { organization });

    const employees = await User.find({ organization }).select("-password");

    // return consistent object
    res.json({ users: employees });
  } catch (error) {
    logger.error("Get employees failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSalesEmployees = async (req, res) => {
  try {
    const organizationId = req.organization._id;

    const salesEmployees = await User.find({
      organizationId,
      department: "sales", // 👈 IMPORTANT CHANGE
    })

    return res.status(200).json({
      message: "Sales employees fetched successfully",
      data: salesEmployees,
    });
  } catch (error) {
    console.error("Get Sales Employees Error:", error);
    return res.status(500).json({
      message: "Server error while fetching sales employees",
    });
  }
};