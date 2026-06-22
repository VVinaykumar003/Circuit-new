// server.js — ERP SaaS Engine Boot

require("dotenv").config();
const http = require("http");

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

const app = require("./app");
const { connectDB } = require("./config/db");
const { initializeSocket } = require("./services/socket.service");
const config = require("./config");
const logger = require("./common/libs/logger");

const server = http.createServer(app);
let io = null;

const divider = () =>
  console.log(
    chalk.gray("──────────────────────────────────────────────────────────────")
  );

async function boot() {
  console.clear();

  console.log(
    chalk.cyan(`
==================================================
        🚀  CIRCUIT ERP — SAAS ENGINE BOOT
==================================================`)
  );

  const bootStart = Date.now();
  logger.info("[SERVER] Boot sequence started");

  // ------------------------------------------------------------
  // CONFIG VALIDATION
  // ------------------------------------------------------------
  process.stdout.write(chalk.yellow("🔧 CONFIG CHECK ........... "));
  try {
    config.validate?.();
    console.log(chalk.green("✔ OK"));
  } catch (err) {
    console.log(chalk.bgRed("✖ FAILED"));
    logger.error(err.message);
    process.exit(1);
  }

  // ------------------------------------------------------------
  // DATABASE CONNECTION
  // ------------------------------------------------------------
  process.stdout.write(chalk.yellow("🛢️  MONGODB CONNECT ........ "));
  try {
    await connectDB();
    console.log(chalk.green("✔ CONNECTED"));
  } catch (err) {
    console.log(chalk.bgRed("✖ FAILED"));
    logger.error(err.message);
    process.exit(1);
  }

  divider();

  // ------------------------------------------------------------
  // SOCKET + REDIS
  // ------------------------------------------------------------
  process.stdout.write(chalk.yellow("📡 SOCKET + REDIS ......... "));
  try {
    io = await initializeSocket(server);
    console.log(chalk.green("✔ READY"));
  } catch (err) {
    console.log(chalk.yellow("⚠ FALLBACK MODE"));
    logger.warn("Socket init failed. Running without Redis adapter.");
    io = null;
  }

  divider();

  // ------------------------------------------------------------
  // START SERVER
  // ------------------------------------------------------------
  const PORT = config.PORT || 5000;

  server.listen(PORT, () => {
    console.log(chalk.green("🚀 SERVER ONLINE"));
    divider();

    console.log(chalk.white("🌐 Port: ") + chalk.cyan(PORT));
    console.log(
      chalk.white("🗄  Database: ") +
        chalk.green("MongoDB Atlas Connected")
    );
    console.log(
      chalk.white("🔐 Auth: ") + chalk.green("JWT Enabled")
    );
    console.log(
      chalk.white("📦 Environment: ") +
        chalk.yellow(process.env.NODE_ENV || "development")
    );
    console.log(
      chalk.white("⚡ Redis: ") +
        (config.REDIS_URL ? chalk.green("Enabled") : chalk.gray("Disabled"))
    );

    divider();

    console.log(
      chalk.yellow(`⏱ Boot Time: ${Date.now() - bootStart} ms`)
    );
    divider();

    logger.info(`[SERVER] Running on port ${PORT}`);
  });
}

// ------------------------------------------------------------
// GRACEFUL SHUTDOWN
// ------------------------------------------------------------
async function gracefulShutdown(sig) {
  console.log(chalk.red(`\n⚠ ${sig} received. Shutting down...`));
  logger.warn(`[SERVER] ${sig} received`, {sig});

  if (io && io.close) {
    await new Promise((resolve) => io.close(resolve));
    logger.info("Socket.IO closed");
  }

  await new Promise((resolve) => server.close(resolve));
  logger.info("HTTP server closed");

  console.log(chalk.blue("👋 Shutdown complete"));
  process.exit(0);
}

["SIGINT", "SIGTERM"].forEach((sig) =>
  process.on(sig, () => gracefulShutdown(sig))
);

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
  gracefulShutdown("unhandledRejection");
});


boot();