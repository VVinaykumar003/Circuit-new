const path = require("path");
const http = require("http");
const dotenv = require("dotenv");
const FormData = require("form-data");

const backendPath = "d:/Projects/REACT_PROJECT/Circuit-new-per/Circuit-new-main/backend";
dotenv.config({ path: path.join(backendPath, ".env") });

const { connectDB, mongoose } = require(path.join(backendPath, "src/config/db"));
const app = require(path.join(backendPath, "src/app"));
const User = require(path.join(backendPath, "src/models/User.model"));
const Organization = require(path.join(backendPath, "src/models/Organization.model"));
const Project = require(path.join(backendPath, "src/models/Project.model"));

async function testAllUploadFeatures() {
  console.log("============================================================");
  console.log("CIRCUIT ERP — GLOBAL FILE UPLOAD & LOCALHOST AUTH AUDIT");
  console.log("============================================================\n");

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, "127.0.0.1", resolve));
  const baseUrl = "http://127.0.0.1:5099";

  const org = await Organization.findOne({ slug: "abc-private-lmitied" });
  if (!org) throw new Error("Organization not found");

  const adminEmail = `upload_admin_${Date.now()}@test.com`;
  const adminPassword = "AdminPassword@123";

  const user = await User.create({
    name: "Upload Admin Tester",
    email: adminEmail,
    password: adminPassword,
    organization: org._id,
    role: "admin",
    status: "active",
    designation: "lead",
    department: "it"
  });

  let project = await Project.findOne({ orgId: org._id });
  if (!project) {
    project = await Project.create({
      projectName: "Upload Test Project",
      projectState: "Active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 30),
      orgId: org._id,
      userId: user._id,
      participants: [{ memberId: user._id, role: "Lead" }]
    });
  }

  const results = [];

  const runMultipart = (path, form, cookie) => {
    return new Promise((resolve, reject) => {
      form.submit({
        host: "127.0.0.1",
        port: 5099,
        path,
        headers: cookie ? { Cookie: cookie } : {}
      }, (err, res) => {
        if (err) return reject(err);
        let body = "";
        res.on("data", (c) => body += c);
        res.on("end", () => {
          let parsed;
          try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
          resolve({ status: res.statusCode, body: parsed });
        });
      });
    });
  };

  // 1. Localhost Login
  console.log("--- STEP 1: Localhost Authentication Login ---");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });
  let sessionCookie = "";
  const setCookie = loginRes.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/token=[^;]+/);
    if (match) sessionCookie = match[0];
  }
  const loginPass = loginRes.status === 200 && !!sessionCookie;
  results.push({ test: "1. Localhost Login", pass: loginPass, status: loginRes.status });
  console.log("Login Result:", loginPass ? "PASS" : "FAIL", "Status:", loginRes.status);

  // 2. /auth/me verification
  console.log("\n--- STEP 2: Verify /auth/me Session ---");
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: sessionCookie }
  });
  const meData = await meRes.json();
  const mePass = meRes.status === 200 && meData.slug === org.slug;
  results.push({ test: "2. /auth/me Verification", pass: mePass, status: meRes.status });
  console.log("/auth/me Result:", mePass ? "PASS" : "FAIL", "Status:", meRes.status);

  // 3. Create Task WITHOUT file
  console.log("\n--- STEP 3: Create Task WITHOUT Attachment ---");
  const f3 = new FormData();
  f3.append("title", "Task No Attach " + Date.now());
  f3.append("description", "Testing task without attachment");
  f3.append("priority", "medium");
  f3.append("status", "pending");
  f3.append("assignedTo", user._id.toString());
  const r3 = await runMultipart(`/api/tasks/${org.slug}/addTasks/${project._id}`, f3, sessionCookie);
  const p3 = r3.status === 201;
  results.push({ test: "3. Create Task Without File", pass: p3, status: r3.status });
  console.log("Result 3:", p3 ? "PASS" : "FAIL", "Status:", r3.status);

  // 4. Create Task WITH Image (PNG)
  console.log("\n--- STEP 4: Create Task WITH Image (PNG) ---");
  const f4 = new FormData();
  f4.append("title", "Task With PNG " + Date.now());
  f4.append("description", "Testing task with PNG");
  f4.append("priority", "high");
  f4.append("status", "pending");
  f4.append("assignedTo", user._id.toString());
  const pngBuf = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  f4.append("attachments", pngBuf, { filename: "test.png", contentType: "image/png" });
  const r4 = await runMultipart(`/api/tasks/${org.slug}/addTasks/${project._id}`, f4, sessionCookie);
  const p4 = r4.status === 201 && r4.body?.data?.attachments?.length > 0;
  results.push({ test: "4. Create Task With Image", pass: p4, status: r4.status });
  console.log("Result 4:", p4 ? "PASS" : "FAIL", "Status:", r4.status);

  // 5. Create Task WITH PDF
  console.log("\n--- STEP 5: Create Task WITH PDF ---");
  const f5 = new FormData();
  f5.append("title", "Task With PDF " + Date.now());
  f5.append("description", "Testing task with PDF");
  f5.append("priority", "high");
  f5.append("status", "pending");
  f5.append("assignedTo", user._id.toString());
  const pdfBuf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n");
  f5.append("attachments", pdfBuf, { filename: "contract.pdf", contentType: "application/pdf" });
  const r5 = await runMultipart(`/api/tasks/${org.slug}/addTasks/${project._id}`, f5, sessionCookie);
  const p5 = r5.status === 201 && r5.body?.data?.attachments?.length > 0;
  results.push({ test: "5. Create Task With PDF", pass: p5, status: r5.status });
  console.log("Result 5:", p5 ? "PASS" : "FAIL", "Status:", r5.status);

  // 6. Create Task WITH TXT / Document
  console.log("\n--- STEP 6: Create Task WITH TXT Document ---");
  const f6 = new FormData();
  f6.append("title", "Task With TXT " + Date.now());
  f6.append("description", "Testing task with TXT file");
  f6.append("priority", "low");
  f6.append("status", "pending");
  f6.append("assignedTo", user._id.toString());
  const txtBuf = Buffer.from("Circuit ERP Task Specification Document Content");
  f6.append("attachments", txtBuf, { filename: "spec.txt", contentType: "text/plain" });
  const r6 = await runMultipart(`/api/tasks/${org.slug}/addTasks/${project._id}`, f6, sessionCookie);
  const p6 = r6.status === 201 && r6.body?.data?.attachments?.length > 0;
  results.push({ test: "6. Create Task With TXT", pass: p6, status: r6.status });
  console.log("Result 6:", p6 ? "PASS" : "FAIL", "Status:", r6.status);

  // 7. Security: Rejection of Executable (.exe)
  console.log("\n--- STEP 7: Security Filter Rejection of Executable (.exe) ---");
  const f7 = new FormData();
  f7.append("title", "Malicious Task");
  f7.append("description", "Should be rejected");
  f7.append("attachments", Buffer.from("MZmaliciousbinarycontent"), { filename: "payload.exe", contentType: "application/x-msdownload" });
  const r7 = await runMultipart(`/api/tasks/${org.slug}/addTasks/${project._id}`, f7, sessionCookie);
  const p7 = r7.status === 415 || r7.status === 400;
  results.push({ test: "7. Security Filter (.exe rejection)", pass: p7, status: r7.status });
  console.log("Result 7:", p7 ? "PASS" : "FAIL", "Status:", r7.status);

  // 8. Work Update with Attachment
  console.log("\n--- STEP 8: Work Update WITH Attachment ---");
  const f8 = new FormData();
  f8.append("description", "Daily update completed with screenshots");
  f8.append("status", "completed");
  f8.append("attachments", pngBuf, { filename: "screenshot.png", contentType: "image/png" });
  const r8 = await runMultipart(`/api/${org.slug}/workUpdate/${project._id}`, f8, sessionCookie);
  const p8 = r8.status === 200 || r8.status === 201;
  results.push({ test: "8. Work Update With Attachment", pass: p8, status: r8.status });
  console.log("Result 8:", p8 ? "PASS" : "FAIL", "Status:", r8.status);

  // 9. Notification with Attachment
  console.log("\n--- STEP 9: Notification WITH Attachment ---");
  const f9 = new FormData();
  f9.append("title", "Company Announcement");
  f9.append("message", "Please check the attached quarterly report.");
  f9.append("sendTo", "all");
  f9.append("priority", "normal");
  f9.append("attachments", pdfBuf, { filename: "report.pdf", contentType: "application/pdf" });
  const r9 = await runMultipart(`/api/${org.slug}/notification`, f9, sessionCookie);
  const p9 = r9.status === 200 || r9.status === 201;
  results.push({ test: "9. Notification With Attachment", pass: p9, status: r9.status });
  console.log("Result 9:", p9 ? "PASS" : "FAIL", "Status:", r9.status);

  // 10. Direct Image Upload Service
  console.log("\n--- STEP 10: Direct Image Upload API ---");
  const f10 = new FormData();
  f10.append("image", pngBuf, { filename: "avatar.png", contentType: "image/png" });
  const r10 = await runMultipart(`/api/upload/upload-image`, f10, sessionCookie);
  const p10 = r10.status === 200 && (r10.body?.imageUrl || r10.body?.secure_url);
  results.push({ test: "10. Direct Image Upload Service", pass: !!p10, status: r10.status });
  console.log("Result 10:", p10 ? "PASS" : "FAIL", "Status:", r10.status);

  // 11. Logout & Invalidation
  console.log("\n--- STEP 11: Logout Invalidation ---");
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: sessionCookie }
  });
  const p11 = logoutRes.status === 200;
  results.push({ test: "11. Logout Invalidation", pass: p11, status: logoutRes.status });
  console.log("Result 11:", p11 ? "PASS" : "FAIL", "Status:", logoutRes.status);

  console.log("\n============================================================");
  console.log("FINAL AUDIT RESULTS SUMMARY");
  console.log("============================================================");
  results.forEach(r => {
    console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.test} (HTTP ${r.status})`);
  });

  const allPassed = results.every(r => r.pass);
  console.log(`\nOVERALL SCORE: ${results.filter(r => r.pass).length} / ${results.length} (${allPassed ? "100% SUCCESS" : "FAILURES DETECTED"})`);

  server.close();
  await mongoose.disconnect();
}

testAllUploadFeatures().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});
