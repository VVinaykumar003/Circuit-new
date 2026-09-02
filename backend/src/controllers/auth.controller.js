const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Organization = require("../models/Organization.model");
const User = require("../models/User.model");

const generateSlug = require("../utils/generateSlug");
const logger = require("../common/libs/logger");
const redis = require("../config/redis");
const config = require("../config");


// ======================================================
// CONFIG
// ======================================================

const JWT_SECRET =
  process.env.JWT_SECRET || config.JWT_SECRET;

const JWT_EXPIRES_IN = "1d";

const COOKIE_MAX_AGE =
  24 * 60 * 60 * 1000;


// ======================================================
// COOKIE OPTIONS
// ======================================================

const tokenCookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV === "production",

  sameSite: "lax",

  maxAge: COOKIE_MAX_AGE,

  path: "/",
};


// Client-readable user information.
// IMPORTANT:
// Never put the JWT/token inside this cookie.
const userCookieOptions = {
  httpOnly: false,

  secure:
    process.env.NODE_ENV === "production",

  sameSite: "lax",

  maxAge: COOKIE_MAX_AGE,

  path: "/",
};


// ======================================================
// HELPERS
// ======================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};


const createToken = (user, organization) => {
  return jwt.sign(
    {
      userId: user._id.toString(),

      name: user.name,

      organization:
        user.organization.toString(),

      role: user.role,

      slug: organization.slug,

      department:
        user.department || null,
    },

    JWT_SECRET,

    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};


const getSafeUser = (user, organization) => {
  return {
    userId: user._id,

    name: user.name,

    email: user.email,

    role: user.role,

    organization: user.organization,

    slug: organization.slug,

    department:
      user.department || null,

    customDepartment:
      user.customDepartment || null,

    imageUrl:
      user.imageUrl || null,
  };
};


// ======================================================
// REGISTER COMPANY
// ======================================================

exports.registerCompany = async (req, res) => {
  const session =
    await Organization.startSession();

  try {
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


    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (
      !organizationName?.trim() ||
      !ownerName?.trim() ||
      !organizationEmail?.trim() ||
      !ownerEmail?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organization name, owner name, organization email, owner email and password are required.",
      });
    }


    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }


    const normalizedOrganizationEmail =
      normalizeEmail(organizationEmail);

    const normalizedOwnerEmail =
      normalizeEmail(ownerEmail);


    // --------------------------------------------------
    // Generate slug
    // --------------------------------------------------

    const slug =
      generateSlug(
        organizationName.trim()
      );


    // --------------------------------------------------
    // Check existing organization
    // --------------------------------------------------

    const [
      existingOrganization,
      existingOwner,
    ] = await Promise.all([
      Organization.findOne({
        $or: [
          { slug },
          {
            organizationEmail:
              normalizedOrganizationEmail,
          },
        ],
      })
        .select("_id slug organizationEmail")
        .lean(),

      User.findOne({
        email: normalizedOwnerEmail,
      })
        .select("_id email")
        .lean(),
    ]);


    if (existingOrganization) {
      return res.status(409).json({
        success: false,
        message:
          "An organization with this name or email already exists.",
      });
    }


    if (existingOwner) {
      return res.status(409).json({
        success: false,
        message:
          "Owner email is already registered.",
      });
    }


    // --------------------------------------------------
    // Transaction
    // --------------------------------------------------

    session.startTransaction();


    const [organization] =
      await Organization.create(
        [
          {
            organizationName:
              organizationName.trim(),

            ownerName:
              ownerName.trim(),

            organizationEmail:
              normalizedOrganizationEmail,

            ownerEmail:
              normalizedOwnerEmail,

            slug,

            registrationNumber:
              registrationNumber?.trim(),

            phoneNumber:
              phoneNumber?.trim(),

            address: {
              addressLine:
                address.addressLine,

              city:
                address.city,

              state:
                address.state,

              country:
                address.country,

              pincode:
                address.pincode,
            },

            subscriptionStatus:
              "trial",
          },
        ],
        { session }
      );


    // --------------------------------------------------
    // Create owner
    // --------------------------------------------------

    await User.create(
      [
        {
          name: ownerName.trim(),

          email:
            normalizedOwnerEmail,

          password,

          organization:
            organization._id,

          slug,

          role: "owner",
        },
      ],
      { session }
    );


    await session.commitTransaction();


    logger.info(
      "Organization registered successfully",
      {
        organizationId:
          organization._id.toString(),

        slug,

        ownerEmail:
          normalizedOwnerEmail,
      }
    );


    return res.status(201).json({
      success: true,

      message:
        "Organization created successfully",

      organizationId:
        organization._id,

      slug,
    });


  } catch (error) {

    await session.abortTransaction();

    logger.error(
      "Register company error",
      {
        error: error.message,
        stack: error.stack,
      }
    );


    // Duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Organization or user already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to register organization.",
    });


  } finally {

    await session.endSession();

  }
};


// ======================================================
// LOGIN
// ======================================================

exports.login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    const normalizedEmail =
      normalizeEmail(email);


    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }


    logger.info(
      `Login attempt: ${normalizedEmail}`
    );


    // --------------------------------------------------
    // Find User
    // --------------------------------------------------

    const user =
      await User.findOne({
        email: normalizedEmail,
      })
        .select(
          "+password name email role organization department customDepartment imageUrl"
        )
        .lean(false);


    if (!user) {

      logger.warn(
        `Login failed: user not found (${normalizedEmail})`
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    // --------------------------------------------------
    // Password
    // --------------------------------------------------

    const valid =
      await user.comparePassword(
        password
      );


    if (!valid) {

      logger.warn(
        `Invalid password for: ${normalizedEmail}`
      );


      const key =
        `login_fail:${normalizedEmail}`;


      await redis.incr(key);

      await redis.expire(
        key,
        300
      );


      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }


    // --------------------------------------------------
    // Organization
    // --------------------------------------------------

    const organization =
      await Organization.findById(
        user.organization
      )
        .select(
          "_id slug organizationName subscriptionStatus"
        )
        .lean();


    if (!organization) {

      logger.error(
        "User organization not found",
        {
          userId:
            user._id.toString(),

          organizationId:
            user.organization?.toString(),
        }
      );


      return res.status(403).json({
        success: false,
        message:
          "Organization associated with this account was not found.",
      });
    }


    // --------------------------------------------------
    // JWT
    // --------------------------------------------------

    const token =
      createToken(
        user,
        organization
      );


    // --------------------------------------------------
    // Cookies
    // --------------------------------------------------

    res.cookie(
      "token",
      token,
      tokenCookieOptions
    );


    const safeUser =
      getSafeUser(
        user,
        organization
      );


    res.cookie(
      "user",
      JSON.stringify(safeUser),
      userCookieOptions
    );


    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    logger.info(
      `Login success: ${normalizedEmail}`,
      {
        userId:
          user._id.toString(),

        organizationId:
          organization._id.toString(),
      }
    );


    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      user: safeUser,
    });


  } catch (error) {

    logger.error(
      "Login failed",
      {
        error: error.message,
        stack: error.stack,
      }
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to login.",
    });
  }
};


// ======================================================
// GET CURRENT USER
// ======================================================

exports.getMe = async (req, res) => {
  try {

    const authenticatedUser =
      req.user;


    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    const user =
      await User.findById(
        authenticatedUser._id ||
        authenticatedUser.userId
      )
        .select(
          "_id name email role organization department customDepartment imageUrl"
        )
        .lean();


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    const organization =
      await Organization.findById(
        user.organization
      )
        .select(
          "_id slug organizationName subscriptionStatus"
        )
        .lean();


    if (!organization) {
      return res.status(403).json({
        success: false,
        message:
          "Organization not found.",
      });
    }


    const safeUser =
      getSafeUser(
        user,
        organization
      );


    return res.status(200).json({
      success: true,

      user: safeUser,

      slug:
        organization.slug,
    });


  } catch (error) {

    logger.error(
      "Get current user failed",
      {
        error: error.message,
        stack: error.stack,
      }
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve user information.",
    });
  }
};


// ======================================================
// LOGOUT
// ======================================================

exports.logout = (req, res) => {

  res.clearCookie(
    "token",
    {
      ...tokenCookieOptions,
      maxAge: undefined,
    }
  );


  res.clearCookie(
    "user",
    {
      ...userCookieOptions,
      maxAge: undefined,
    }
  );


  return res.status(200).json({
    success: true,
    message:
      "Logged out successfully.",
  });
};