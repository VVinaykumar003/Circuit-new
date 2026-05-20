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
      name, email, password, phone, gender, dateOfBirth, currentAddress, permanentAddress,imageUrl,
      // Emergency
      emergencyName, emergencyPhone, emergencyRelation,
      // Identity
      aadhaar, pan, passport,
      // Employment
      role, designation, department, joiningDate, previousCompany,
      // Financial
      bankName, accountNumber, ifscCode
    } = req.body;

    

    const organization = req.organization._id;

    logger.info("Create employee request", { 
      email,
      organization
    });

    const existing = await User.findOne({
      email,
      organization
    });

    if (existing) {

      logger.warn("Employee already exists", { email });

      return res.status(400).json({
        message: "Employee already exists"
      });

    }

    const user = await User.create({
      // Personal
      name, email, password, phone, gender, dateOfBirth, currentAddress, permanentAddress,imageUrl,
      // Emergency
      emergencyName, emergencyPhone, emergencyRelation,
      // Identity
      aadhaar, pan, passport,
      // Employment
      role: role || "member",
      designation, department, joiningDate, previousCompany,
      // Financial
      bankName, accountNumber, ifscCode,
      // Organization
      organization
    });

    logger.info("Employee created", {
      userId: user._id,
      organization
    });

    console.log(
      chalk.green(`✔ Employee created → ${user}`)
    );

      // 2. Insert the Activity Log here!
    await Activity.create({
      organization: organization, 
      user: req.user.userId || req.user._id,
      action: "Member Added",
      message: `Added a new member: ${user.name}`,
      referenceId: user._id,
      referenceModel: "User"
    });

    // 3. Emit Realtime Notification to Admins/Managers
    try {
      const io = getIO();
      // Exclude the admin who is performing the action
      const admins = await User.find({ organization, role: { $in: ['admin', 'owner', 'manager'] }, _id: { $ne: req.user.userId || req.user._id } });
      
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit('new_notification', {
          title: "New Member Added",
          message: `A new member, ${user.name}, has been added.`,
          priority: "normal"
        });
      });
    } catch (err) {
      logger.error("Socket emit failed for member creation", err);
    }

    res.status(201).json(user);

  } catch (error) {

    logger.error("Create employee failed", {
      error: error.message
    });

    res.status(500).json({
      message: "Server error",
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
