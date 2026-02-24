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

  const categoriesText = Array.isArray(categories)
    ? categories.join(", ")
    : categories || "Not specified";

  const noteText = specialRequest || message || "Not provided";

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
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


// ✅ NEW: Personal Concierge route
// Frontend will call: POST /api/email/personal-concierge
router.post("/personal-concierge", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `New Personal Concierge Request: ${subject || "No subject"}`,
      html: `
        <h2>New Personal Concierge Request</h2>
        <p><strong>Name:</strong> ${name || "-"}</p>
        <p><strong>Email:</strong> ${email || "-"}</p>
        <p><strong>Subject:</strong> ${subject || "-"}</p>
        <p><strong>Message:</strong></p>
        <p>${message || "-"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Thank you! Your concierge request has been sent.",
    });
  } catch (error) {
    console.error("Concierge Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send concierge request",
      error: error.message,
    });
  }
});

export default router;
