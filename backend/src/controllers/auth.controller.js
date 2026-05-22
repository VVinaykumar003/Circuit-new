const jwt = require("jsonwebtoken");
// const chalk = require("chalk");

const Organization = require("../models/Organization.model");
const User = require("../models/User.model");
const generateSlug = require("../utils/generateSlug");
const logger = require("../common/libs/logger");
const config = require("../config");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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


// ------------------------------------------------------
// REGISTER COMPANY
// ------------------------------------------------------


exports.registerCompany = async (req, res) => {
  try {
    console.log(req.body);

    const {
      organizationName,
      ownerName,
      organizationEmail,
      ownerEmail,
      password,
      registrationNumber,
      phoneNumber,
      address = {},
    } = req.body;

    // Required fields check
    if (!organizationName || !ownerName || !organizationEmail || !ownerEmail || !password) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // Create slug
    const slug = generateSlug(organizationName);

    // Check slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(400).json({
        message: "Organization already exists",
      });
    }

    // Check organization email
    const emailExists = await Organization.findOne({ organizationEmail });
    if (emailExists) {
      return res.status(400).json({
        message: "Organization email already registered",
      });
    }


    // Create organization
    const org = await Organization.create({
      organizationName,
      ownerName,
      organizationEmail,
      ownerEmail,
     
      slug,
      registrationNumber,
      phoneNumber,
      address: {
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
      },
      subscriptionStatus: "trial",
    });

    // Create owner user
    await User.create({
      name: ownerName,
      email: ownerEmail,
      password, // user schema will hash it
      organization: org._id,
      slug,
      role: "owner",
    });

    return res.status(201).json({
      message: "Organization created successfully",
      organizationId: org._id,
      slug,
    });
  } catch (error) {
    console.error("Register company error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt: ${email}`);

    // TODO: Brute force check (Requires configuring a real Redis client in config/redis.js)
    /*
    // const fails = await redis.get(`login_fail:${email}`);
    // if (parseInt(fails) >= 5) {
    //   return res.status(429).json({ message: "Too many attempts. Try again in 5 minutes." });
    // }
    */

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.warn(`Login failed: user not found (${email})`);
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      logger.warn(`Invalid password for: ${email}`);
      // await redis.incr(`login_fail:${email}`);
      // await redis.expire(`login_fail:${email}`, 300);
      return res.status(401).json({ message: "Invalid password" });
    }

    const org = await Organization.findById(user.organization);
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        organization: user.organization,
        role: user.role,
        slug: org.slug,
        department: user.department || null,
        imageUrl: user.imageUrl || null,
      },
      config.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Secure httpOnly cookie only — no token in response body
   res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
});

    // TODO: Clear fail counter on success
    // await redis.del(`login_fail:${email}`);

    logger.info(`Login success: ${email}`);

    return res.json({
      message: "Login successful",
      slug: org.slug,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        slug: org.slug,
        department: user.department || null,
        imageUrl: user.imageUrl || null,
      },
    });

  } catch (error) {
    logger.error("Login failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    logger.info(`getMe called for userId: ${user._id}`);

    const org = await Organization.findById(user.organization);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    return res.json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        department: user.department || null,
        imageUrl: user.imageUrl || null,
        // ✅ No token here
      },
      slug: org.slug,
    });
  } catch (err) {
    logger.error("getMe failed", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  // ✅ Options must match what was set in login
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("user", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.json({ message: "Logged out successfully" });
};
