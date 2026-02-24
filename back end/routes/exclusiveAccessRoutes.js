// routes/emailRoutes.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// ✅ Re-use one transporter (better than creating inside handler)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,      // from .env
    pass: process.env.EMAIL_PASSWORD,  // from .env
  },
});

// ✅ Match the frontend: POST /api/email/exclusive-access
router.post("/exclusive-access", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    boutique,
    categories = [],
    date,
    time,
    specialRequest,
    message,
  } = req.body;

  // Make sure categories & message are safe strings
  const categoriesText = Array.isArray(categories)
    ? categories.join(", ")
    : categories || "Not specified";

  const noteText = specialRequest || message || "Not provided";

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,  // sender address
      to: process.env.EMAIL_TO,      // your receiving email
      subject: "New Exclusive Collection Request",
      html: `
        <h2>New Request for Exclusive Collection Access</h2>
        <p><strong>Name:</strong> ${fullName || "-"} </p>
        <p><strong>Email:</strong> ${email || "-"} </p>
        <p><strong>Phone:</strong> ${phone || "-"} </p>
        <p><strong>Boutique:</strong> ${boutique || "-"} </p>
        <p><strong>Date:</strong> ${date || "-"} </p>
        <p><strong>Time:</strong> ${time || "-"} </p>
        <p><strong>Categories:</strong> ${categoriesText}</p>
        <p><strong>Special Request / Message:</strong> ${noteText}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Request submitted successfully!",
    });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send request",
      error: error.message,
    });
  }
});

export default router;
