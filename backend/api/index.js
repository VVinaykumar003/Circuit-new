const app = require("../src/app");
const { connectDB } = require("../src/config/db");

// Track database connection across cold starts
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error("Database connection failed", error);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }
  
  return app(req, res);
};
