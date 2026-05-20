const nodemailer = require("nodemailer");

/**
+ * Send an email notification using Nodemailer
 */
exports.sendEmailNotification = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail
      },
    });

    await transporter.sendMail({
      from: `"Circuit ERP" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending Email notification:", error?.message);
  }
};
