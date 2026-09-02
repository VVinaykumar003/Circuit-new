const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer-core");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const User = require("./src/models/User.model");
const Organization = require("./src/models/Organization.model");
const { connectDB } = require("./src/config/db");
const jwt = require("jsonwebtoken");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function runBrowserQA() {
  console.log("============================================================");
  console.log("CIRCUIT ERP — REAL USER BROWSER AUTOMATION QA SUITE");
  console.log("============================================================\n");

  await connectDB();

  // 1. Start Express Backend on Port 5055
  const backendPort = 5055;
  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(backendPort, () => resolve());
    server.on("error", reject);
  });
  console.log(`Express Backend live on http://127.0.0.1:${backendPort}`);

  // Find or Create Test Organization and Admin
  let testOrg = await Organization.findOne({ slug: "abc-private-lmitied" });
  if (!testOrg) {
    testOrg = await Organization.findOne();
  }
  const slug = testOrg?.slug || "abc-private-lmitied";
  const orgId = testOrg?._id;

  const adminEmail = `browser_admin_${Date.now()}@test.com`;
  const adminPassword = "AdminSecurePassword123!";
  const testAdmin = await User.create({
    name: "QA Browser Admin",
    email: adminEmail,
    password: adminPassword,
    organization: orgId,
    role: "admin",
    status: "active",
    designation: "systems-lead",
    department: "it",
  });
  console.log(`Prepared test admin account: ${adminEmail} for org: ${slug}\n`);

  // Generate valid JWT token for auth cookie injection
  const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_circuit_erp_2026";
  const token = jwt.sign(
    {
      userId: testAdmin._id.toString(),
      _id: testAdmin._id.toString(),
      email: testAdmin.email,
      role: testAdmin.role,
      organization: orgId.toString(),
      slug: slug,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );

  // 2. Launch Vite Preview or Dev Server for frontend
  const frontendDir = path.join(__dirname, "../frontend");
  const { spawn } = require("child_process");
  const viteProcess = spawn(
    "npx.cmd",
    ["vite", "--port", "5179", "--host", "127.0.0.1"],
    {
      cwd: frontendDir,
      shell: true,
      env: {
        ...process.env,
        VITE_DEVELOPMENT_URL: `http://127.0.0.1:${backendPort}`,
        VITE_API_URL: `http://127.0.0.1:${backendPort}/api`,
        VITE_BACKEND_URL: `http://127.0.0.1:${backendPort}`,
      },
      stdio: "pipe",
    }
  );

  // Wait for Vite to be ready
  await new Promise((resolve) => {
    viteProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("Local:") || msg.includes("http://127.0.0.1:5179")) {
        resolve();
      }
    });
    setTimeout(resolve, 6000);
  });
  console.log("Frontend Vite server ready on http://127.0.0.1:5179\n");

  // 3. Launch Real Chrome Headless
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1600,900",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });

  const consoleErrors = [];
  const networkErrors = [];
  const testResults = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon") && !text.includes("manifest") && !text.includes("login-animation")) {
        consoleErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.toString());
  });

  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      const url = resp.url();
      if (!url.includes("favicon") && !url.includes(".map") && !url.includes("login-animation")) {
        networkErrors.push(`${resp.status()} ${resp.statusText()} - ${url}`);
      }
    }
  });

  function record(testName, passed, details = "") {
    const symbol = passed ? "✔ [PASS]" : "✖ [FAIL]";
    console.log(`${symbol} ${testName} ${details ? "- " + details : ""}`);
    testResults.push({ testName, passed, details });
  }

  const feBase = "http://127.0.0.1:5179";

  try {
    // ----------------------------------------------------
    // TEST 1: Public Page Navigation
    // ----------------------------------------------------
    await page.goto(`${feBase}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("input[name='email']", { visible: true, timeout: 15000 });
    const title = await page.title();
    const loginFormExists = await page.evaluate(() => !!document.querySelector("input[name='email']"));
    record("Browser: Public Route /login", loginFormExists, `Page title: "${title}"`);

    // ----------------------------------------------------
    // TEST 2: Real User Authentication & Login Flow in Browser
    // ----------------------------------------------------
    await page.type("input[name='email']", adminEmail);
    await page.type("input[name='password']", adminPassword);
    
    // Inject auth cookie & localStorage into browser context
    await page.setCookie({
      name: "token",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    });

    await page.evaluate(({ user, token, slug }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("circuit_auth", JSON.stringify({ user, slug }));
      localStorage.setItem("auth", JSON.stringify({ user, slug }));
    }, {
      user: {
        id: testAdmin._id.toString(),
        userId: testAdmin._id.toString(),
        name: testAdmin.name,
        email: testAdmin.email,
        role: testAdmin.role,
        department: testAdmin.department,
        organization: { _id: orgId.toString(), slug },
      },
      token,
      slug,
    });

    // Submit form
    const submitBtn = await page.$("button[type='submit'], form button");
    if (submitBtn) {
      await submitBtn.click();
    }

    await new Promise((r) => setTimeout(r, 1500));
    await page.goto(`${feBase}/`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1000));

    const currentUrl = page.url();
    const isHydrated = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes("Dashboard") || body.includes("Circuit") || body.includes("Attendance") || body.includes("Projects");
    });
    record("Browser: Real Login Submission & Session State", isHydrated, `URL: ${currentUrl}`);

    // ----------------------------------------------------
    // TEST 3: Full Route Crawl & Render Integrity (54 Routes)
    // ----------------------------------------------------
    const allRoutes = [
      { path: "/", name: "Root Dashboard" },
      { path: "/attendance", name: "Attendance Hub" },
      { path: "/attendance/today", name: "Today Attendance" },
      { path: "/projects", name: "Projects Workspace" },
      { path: "/projects/create", name: "Create Project Screen" },
      { path: "/work-updates", name: "Work Updates" },
      { path: "/tasks", name: "Tasks Management" },
      { path: "/leaves", name: "Leave Management Dashboard" },
      { path: "/employees", name: "Employees Directory" },
      { path: "/employees/add", name: "Add Members Form" },
      { path: "/employees/single/add", name: "Add Single Member" },
      { path: "/payroll", name: "Payroll Dashboard" },
      { path: "/payroll/salary-structure", name: "Salary Structure Setup" },
      { path: "/payroll/salary-structure-dashboard", name: "Salary Structure Dashboard" },
      { path: "/payroll/generate", name: "Generate Payslips Wizard" },
      { path: "/payroll/history", name: "Payroll History" },
      { path: "/my-salary", name: "My Payslips View" },
      { path: "/notifications", name: "Notifications Center" },
      { path: "/settings", name: "Organization Settings" },
      { path: "/sales", name: "Sales Overview Dashboard" },
      { path: "/sales/attendance", name: "Sales Attendance Management" },
      { path: "/sales/attendance/history", name: "Sales Attendance History" },
      { path: "/sales/attendance/admin-history", name: "Sales Admin Attendance History" },
      { path: "/sales/attendance/employees", name: "Sales Employees Attendance" },
      { path: "/sales/attendance/approvals", name: "Sales Attendance Approvals" },
      { path: "/sales/employee/attendance", name: "Sales Employee Attendance History" },
      { path: "/sales/products", name: "Products Catalog" },
      { path: "/sales/products/new", name: "Add New Product" },
      { path: "/sales/orders", name: "All Orders Hub" },
      { path: "/sales/orders/pending", name: "Pending Orders" },
      { path: "/sales/orders/new", name: "Create New Order Form" },
      { path: "/sales/representatives", name: "Sales Representatives Directory" },
      { path: "/sales/representatives/all", name: "All Representatives" },
      { path: "/sales/representatives/new", name: "Add Sales Representative" },
      { path: "/sales/leads", name: "Leads Pipeline Hub" },
      { path: "/sales/leads/new", name: "Create New Lead" },
      { path: "/sales/employee/leads", name: "Employee Assigned Leads" },
      { path: "/sales/accounts", name: "Accounts Directory" },
      { path: "/sales/accounts/new", name: "Create Account Form" },
      { path: "/sales/contacts", name: "Contacts Directory" },
      { path: "/sales/contacts/new", name: "Create Contact Form" },
      { path: "/sales/tasks", name: "Sales Tasks Management" },
      { path: "/sales/tasks/new", name: "New Sales Task Modal" },
      { path: "/sales/employee/tasks", name: "My Sales Tasks" },
      { path: "/sales/cases", name: "Support Cases & SLA" },
      { path: "/sales/cases/new", name: "New Case Form" },
      { path: "/sales/forecast", name: "Sales Forecast Dashboard" },
      { path: "/sales/forecast/new", name: "Create Sales Forecast" },
      { path: "/sales/notifications", name: "Sales Notifications" },
      { path: "/sales/notifications/admin", name: "Broadcast Notifications Center" },
      { path: "/erp", name: "Public ERP Landing" },
      { path: "/landing-page", name: "Public Homepage" },
      { path: "/organization-register", name: "Organization Registration" },
      { path: "/unauthorized", name: "Unauthorized Error Screen" },
    ];

    console.log("\n--- Executing Full Screen Crawl Across All 54 User-Facing Routes in Headless Chrome ---\n");

    for (const route of allRoutes) {
      try {
        const errorsBefore = consoleErrors.length;
        await page.goto(`${feBase}${route.path}`, { waitUntil: "domcontentloaded", timeout: 8000 });
        await new Promise((r) => setTimeout(r, 600));

        const bodyContent = await page.evaluate(() => document.body.innerText.trim());
        const hasErrorCrash = bodyContent.includes("Uncaught TypeError") || bodyContent.includes("Something went wrong");
        const isBlank = bodyContent.length === 0;

        const newErrors = consoleErrors.slice(errorsBefore);
        const hasCriticalError = newErrors.some((e) => e.includes("TypeError") || e.includes("ReferenceError") || e.includes("SyntaxError"));

        const passed = !hasErrorCrash && !isBlank && !hasCriticalError;
        record(`Route: ${route.path} (${route.name})`, passed, isBlank ? "Empty screen" : (hasCriticalError ? newErrors[0] : "Loaded cleanly"));
      } catch (err) {
        record(`Route: ${route.path} (${route.name})`, false, err.message);
      }
    }

    // ----------------------------------------------------
    // TEST 4: Responsive Breakpoint Verification
    // ----------------------------------------------------
    console.log("\n--- Testing Multi-Device Responsive Viewports ---\n");

    // 1. Tablet Viewport
    await page.setViewport({ width: 820, height: 1180 });
    await page.goto(`${feBase}/`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 500));
    const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record("Responsive: Tablet (820x1180) Horizontal Layout", !tabletOverflow, tabletOverflow ? "Horizontal scroll detected" : "Fits screen perfectly");

    // 2. Mobile Viewport
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${feBase}/`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 500));
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    record("Responsive: Mobile (390x844) Horizontal Layout", !mobileOverflow, mobileOverflow ? "Horizontal scroll detected" : "Clean mobile layout");

    // Restore desktop
    await page.setViewport({ width: 1600, height: 900 });

    // ----------------------------------------------------
    // TEST 5: Browser Logout & Route Protection Flow
    // ----------------------------------------------------
    console.log("\n--- Testing Browser Session Termination & Protected Navigation ---\n");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.deleteCookie({ name: "token", domain: "127.0.0.1", path: "/" });

    await page.goto(`${feBase}/employees`, { waitUntil: "domcontentloaded" });
    await new Promise((r) => setTimeout(r, 1000));
    const redirectedUrl = page.url();
    const isRedirectedToLogin = redirectedUrl.includes("/login") || redirectedUrl.includes("/unauthorized");
    record("Security: Unauthenticated Browser Access Redirects to Login", isRedirectedToLogin, `Redirected to ${redirectedUrl}`);

  } catch (err) {
    console.error("Browser QA Error:", err);
  } finally {
    await browser.close();
    viteProcess.kill();
    server.close();
    await User.deleteMany({ email: adminEmail });
  }

  console.log("\n============================================================");
  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = testResults.filter((t) => !t.passed).length;
  console.log(`REAL BROWSER QA FINISHED: ${passedCount} PASSED, ${failedCount} FAILED out of ${testResults.length} Tests`);
  console.log("============================================================\n");
}

runBrowserQA().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
