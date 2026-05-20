const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const routes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const memberRoutes = require("./routes/member.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const leavesRoutes = require("./routes/leave.routes");
const leavepolicyRoutes = require("./routes/leavePolicy.routes");
const holidayRoutes = require("./routes/holiday.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const payrollRoutes = require("./routes/payroll.routes");
const salarySlipRoutes = require("./routes/salarySlip.routes.js");
const uploadImageRoutes = require("./routes/uploadRoutes.js");
const activityRoutes = require("./routes/activity.routes.js");
const notificationRoutes = require("./routes/notification.routes.js");
const message = require("./routes/message.routes.js")
const workUpdateRoutes = require("./routes/workUpdate.routes.js");
const cookieParser = require("cookie-parser");

const app = express();

// ------------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------------

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// HTTP Request Logger
app.use(morgan("dev"));

// Response Compression
app.use(compression()); 

// Body Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------
app.use("/", routes);
app.use("/api/auth", authRoutes);
app.use("/api", memberRoutes);
app.use("/api", leavesRoutes);
app.use("/api", leavepolicyRoutes);
app.use("/api", holidayRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/salary-slip", salarySlipRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes); 
app.use("/api/upload", uploadImageRoutes); 
app.use("/api/activity", activityRoutes);
app.use("/api", notificationRoutes);
app.use('/api/messages',message);
app.use("/api", workUpdateRoutes);
// Define a simple GET API endpoint
// app.get('/', (req, res) => {const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", // Fallback added here helps prevent undefined
//   // ...
// });

//   res.json({ message: 'Hello from the backend!' });
// });

// ------------------------------------------------------------
// ERROR HANDLING
// ------------------------------------------------------------

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error(`[Error] ${message}`, err.stack);

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

module.exports = app;