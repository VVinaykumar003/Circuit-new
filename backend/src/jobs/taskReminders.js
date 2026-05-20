
const cron = require("node-cron");
const Task = require("../models/Task.model");
const { sendEmailNotification } = require("../utils/notifier");

// This job runs every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  try {
    // Use the email from .env (fallback to ADMIN_EMAIL or EMAIL_USER)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    console.log("Running daily pending tasks check...");
    
    const now = new Date();

    // Find tasks that are not completed
    const pendingTasks = await Task.find({ status: { $ne: "completed" } }).populate("assignedTo");
    
    // Filter for overdue tasks
    const overdueTasks = pendingTasks.filter(task => task.dueDate && new Date(task.dueDate) < now);

    if (pendingTasks.length > 0) {
      let emailHtml = `<h3>⏰ Daily Task Reminder</h3><p>There are currently <b>${pendingTasks.length} pending tasks</b> across the organization. Please check your dashboard to update your progress.</p>`;
      
      if (overdueTasks.length > 0) {
        emailHtml += `<h3 style="color: red;">🚨 Overdue Tasks Alert</h3><p><b>${overdueTasks.length} tasks</b> are overdue!</p><ul>`;
        overdueTasks.forEach(task => {
          const assignees = task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(u => u.name).join(", ") : "Unassigned";
          emailHtml += `<li><b>${task.title}</b> (Assigned to: ${assignees}) - Due: ${new Date(task.dueDate).toDateString()}</li>`;
        });
        emailHtml += `</ul>`;
      }
      
      const subject = overdueTasks.length > 0 ? "🚨 Action Required: Overdue Tasks" : "Daily Task Reminder";
      await sendEmailNotification(adminEmail, subject, emailHtml);
    } else {
      const emailHtml = `<h3>🎉 Daily Update</h3><p>All caught up! There are 0 pending tasks.</p>`;
      await sendEmailNotification(adminEmail, "Daily Task Update", emailHtml);
    }
  } catch (error) {
    console.error("Error running task reminder cron job:", error);
  }
});
