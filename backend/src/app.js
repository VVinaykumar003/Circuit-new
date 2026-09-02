require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const routes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const organizationRoutes = require("./routes/organization.routes");
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

const productRoutes = require("./routes/product.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const salesRepRoutes = require("./routes/salesRep.routes.js");
const salesTaskRoutes = require("./routes/salesTask.routes.js");
const caseRoutes = require("./routes/case.routes.js");

const leadRoutes = require("./routes/lead.routes.js");
const accountRoutes = require("./routes/account.routes.js");
const contactRoutes = require("./routes/contact.routes.js");
const salesDashboard = require("./routes/salesRoutes.js")
const forecastRoutes = require("./routes/forecastRoutes.js")
// Add this to the top where you require other routes
const salesNotificationRoutes = require('./routes/salesNotification.routes');
const saleAttendance = require('./routes/attendance.routes');



const cookieParser = require("cookie-parser");

const app = express();

// ------------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------------

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, origin);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

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

// Core ERP routes
app.use("/api", organizationRoutes);
app.use("/api", memberRoutes);
app.use("/api", leavesRoutes);
app.use("/api", leavepolicyRoutes);
app.use("/api", holidayRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/salary-slip", salarySlipRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", salesTaskRoutes);
app.use("/api/projects", projectRoutes); 
app.use("/api/upload", uploadImageRoutes); 
app.use("/api/activity", activityRoutes);
app.use("/api", notificationRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/messages', message);
app.use("/api", workUpdateRoutes);

// Sales & CRM routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/reps', salesRepRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sales', salesDashboard);
app.use('/api/forecast', forecastRoutes);
app.use('/api/notification', salesNotificationRoutes); 
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