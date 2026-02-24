import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// POST /api/email/personal-concierge
router.post("/personal-concierge", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and message are required" });
    }

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `New Personal Concierge Request: ${subject || "No subject"}`,
      html: `
        <h2>New Personal Concierge Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📩 Personal concierge email sent for:", name);

    res.json({ success: true, message: "Concierge request sent successfully!" });
  } catch (err) {
    console.error("❌ Email error (/personal-concierge):", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to send concierge email" });
  }
});

export default router;
