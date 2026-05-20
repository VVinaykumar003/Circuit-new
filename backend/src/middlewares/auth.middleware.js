const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User.model");
const logger = require("../common/libs/logger");


const auth = async (req, res, next) => {
  try {
    let token;

    // ------------------------------
    // 1️⃣ Extract Token (Header > Cookie)
    // ------------------------------
    
    // Check Authorization Header
    //"Authorization Header:", req.headers);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } 
    // Check Cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      
      // FIX: Remove surrounding quotes if the cookie was serialized as a string
      if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
    }

    // ------------------------------
    // 2️⃣ Verify Existence
    // ------------------------------
    if (!token) {
      logger.warn("Authentication failed: token missing");
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // ------------------------------
    // 3️⃣ Verify Token
    // ------------------------------
    const secret = process.env.JWT_SECRET || config.JWT_SECRET;
    
    if (!secret) {
      logger.error("JWT_SECRET is missing in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(
      token,
      secret
    );

    // ------------------------------
    // 4️⃣ Find User
    // ------------------------------
    // Support both 'userId' (new) and 'id' (legacy) if necessary
    const userId = decoded.userId || decoded.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      logger.warn("Authentication failed: user not found", {
        userId: userId
      });
      return res.status(401).json({
        message: "User not found"
      });
    }

    // ------------------------------
    // 5️⃣ Attach User
    // ------------------------------
    req.user = user;
    req.user.tenantId = user.organization; 

    next();

  } catch (error) {
    logger.error("Auth middleware error", {
      error: error.message
    });

    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message 
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
