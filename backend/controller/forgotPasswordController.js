const bcrypt = require("bcryptjs");
const transporter = require("../utils/mailer");
const generateOtp = require("../utils/generateOtp");
const db = require("../config/db");

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 5);

const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // CHECK IF EMAIL EXISTS
    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Email not found"
      });
    }

    // GENERATE OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    // Optional: remove old OTPs for same email
    await db.query("DELETE FROM password_resets WHERE email = ?", [email]);

    // Save hashed OTP
    await db.query(
      `INSERT INTO password_resets (email, otp, expires_at, verified)
       VALUES (?, ?, ?, 0)`,
      [email, hashedOtp, expiresAt]
    );

    // Send email
    await transporter.sendMail({
      from: `"PLPS - PH" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Forgot Password Request</h2>
          <p>Your one-time PIN code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in ${OTP_EXPIRES_MINUTES} minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("sendForgotPasswordOtp error:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

// 2. Verify OTP
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const [rows] = await db.query(
      `SELECT * FROM password_resets
       WHERE email = ?
       ORDER BY id DESC
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "No OTP found for this email" });
    }

    const record = rows[0];

    if (record.verified) {
      return res.status(400).json({ message: "OTP already used" });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await db.query(
      "UPDATE password_resets SET verified = 1 WHERE id = ?",
      [record.id]
    );

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyForgotPasswordOtp error:", error);
    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};

// 3. Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP, and new password are required",
      });
    }

    const [rows] = await db.query(
      `SELECT * FROM password_resets
       WHERE email = ?
       ORDER BY id DESC
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "No reset request found" });
    }

    const record = rows[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    // Delete used OTP
    await db.query("DELETE FROM password_resets WHERE email = ?", [email]);

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

module.exports = {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
};