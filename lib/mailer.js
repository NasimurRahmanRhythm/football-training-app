import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a 6-digit OTP to the given email address.
 * @param {string} to  - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Football Training App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1a73e8;">Football Training App</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333; margin: 24px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send an invitation email to the joined user.
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 */
export const sendInviteEmail = async (to, name) => {
  const mailOptions = {
    from: `"Football Training App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to Football Training App!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #4CAF50;">Welcome, ${name || "Athlete"}!</h2>
        <p>You have been invited to join the <strong>Football Training App</strong>.</p>
        <p>We are thrilled to have you on board. Please log in using this email to get started with your training routines and connect with your coaches.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">If you have any questions, feel free to reach out to our support team.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send a pending-approval email to a player who registered but is not yet verified.
 * @param {string} to   - Recipient email
 * @param {string} name - Recipient name
 */
export const sendPendingApprovalEmail = async (to, name) => {
  const mailOptions = {
    from: `"Football Training App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Application Received – We'll Be in Touch!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #4CAF50;">Thank You, ${name || "Athlete"}!</h2>
        <p>Your eagerness to join the academy is highly appreciated.</p>
        <p>Our admin team will get back to you shortly after evaluating your profile.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">If you have any questions in the meantime, feel free to reach out to our support team.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Notify the admin that a new player has applied and is awaiting approval.
 * @param {string} adminEmail  - Admin email address
 * @param {string} playerName  - Name of the player who applied
 * @param {string} playerEmail - Email of the player who applied
 */
export const sendAdminNewPlayerEmail = async (
  adminEmail,
  playerName,
  playerEmail,
) => {
  const mailOptions = {
    from: `"Football Training App" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: "New Player Application – Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1a73e8;">New Player Application</h2>
        <p>A new player has applied to join the academy and is awaiting your approval.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${playerName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Email</td>
            <td style="padding: 8px;">${playerEmail}</td>
          </tr>
        </table>
        <p>Please review their profile and approve or reject accordingly.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #888; font-size: 12px;">This is an automated notification from Football Training App.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
