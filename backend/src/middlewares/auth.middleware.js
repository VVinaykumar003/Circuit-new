const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User.model");
const logger = require("../common/libs/logger");


const auth = async (req, res, next) => {
  try {
    let token = null;

    // --------------------------------------------------
    // 1️⃣ Extract Token: Authorization Header
    // --------------------------------------------------
    if (
      req.headers.authorization &&
      typeof req.headers.authorization === "string" &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[1]) {
        const candidate = parts[1].trim();
        if (candidate && candidate !== "undefined" && candidate !== "null") {
          token = candidate;
        }
      }
    }

    // 2️⃣ Extract Token: Cookies (Fallback if header absent/invalid)
    const getCookieToken = () => {
      if (req.cookies) {
        const cookieCandidate =
          req.cookies.token || req.cookies.jwt || req.cookies.authToken;

        if (cookieCandidate && typeof cookieCandidate === "string") {
          let cleaned = cookieCandidate.trim();
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1).trim();
          }
          if (cleaned && cleaned !== "undefined" && cleaned !== "null") {
            return cleaned;
          }
        }
      }
      return null;
    };

    if (!token) {
      token = getCookieToken();
    }

    // --------------------------------------------------
    // 3️⃣ Verify Existence
    // --------------------------------------------------
    if (!token) {
      logger.warn("Authentication failed: token missing");
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // 4️⃣ Verify Token
    // --------------------------------------------------
    const secret = process.env.JWT_SECRET || config.JWT_SECRET;

    if (!secret) {
      logger.error("JWT_SECRET is missing in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (verifyErr) {
      // If header token was invalid/expired, try cookie fallback
      const cookieToken = getCookieToken();
      if (cookieToken && cookieToken !== token) {
        try {
          decoded = jwt.verify(cookieToken, secret);
        } catch (_) {
          throw verifyErr;
        }
      } else {
        throw verifyErr;
      }
    }

    // --------------------------------------------------
    // 5️⃣ Find User
    // --------------------------------------------------
    const userId = decoded.userId || decoded.id || decoded._id || decoded.sub;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      logger.warn("Authentication failed: user not found", {
        userId: userId,
      });
      return res.status(401).json({
        message: "User not found",
      });
    }

    // --------------------------------------------------
    // 6️⃣ Attach User & Context
    // --------------------------------------------------
    req.user = user;
    req.user.userId = user._id;
    req.user.tenantId = user.organization;

    next();
  } catch (error) {
    logger.error("Auth middleware error", {
      error: error.message,
    });

    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// RestrictTo Middleware: Checks if the logged-in user has the required role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user.role is populated by the protect middleware above
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = auth;
module.exports.restrictTo = restrictTo;
