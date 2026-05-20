// db/mongoose.js
const mongoose = require("mongoose");
const config = require("../config");
const logger = require("../common/libs/logger");

// Enable strictQuery for consistency
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      ...config.mongo.options, // Spread the options from the config file
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10, // optional: tune pool size
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    console.log(`MongoDB connected: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Log the full error object to see details (IP whitelist, auth failure, etc.)
    logger.error("MongoDB connection error:", error);
    throw error; // Throw error so server.js handles the exit
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from DB");
});

module.exports = {
  connectDB,
  mongoose,
};
