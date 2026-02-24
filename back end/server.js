// server.js (ESM)
// --------------------------------------------------
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/user.js"; // ✅ only User is needed for now

// ===========================
// 🔹 Load environment variables
// ===========================
dotenv.config();

console.log("MAIL ENV DEBUG:", {
  MAIL_USER: process.env.MAIL_USER || null,
  MAIL_PASS_SET: !!process.env.MAIL_PASS,
  MAIL_TO: process.env.MAIL_TO || null,
});

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===========================
// 🔹 Basic config
// ===========================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// ===========================
// 🔹 Middleware
// ===========================
app.use(cors());
app.use(express.json());

// ===========================
// 🔹 AUTH MIDDLEWARE
// ===========================
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ===========================
// 🔹 ADMIN MIDDLEWARE
// ===========================
async function requireAdmin(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Failed to verify admin" });
  }
}

// ===========================
// 🔹 Email Transporter Setup
// ===========================
if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_TO) {
  console.warn(
    "⚠️ MAIL_USER / MAIL_PASS / MAIL_TO missing. Email routes may fail."
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) console.error("❌ Nodemailer verify failed:", error.message);
  else console.log("✅ Nodemailer ready");
});

// ===========================
// 🔹 Static files
// ===========================
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public")));

// ===========================
// 🔹 Product loader
// ===========================
let PRODUCT_CACHE = null;
let PRODUCT_MTIME = 0;

async function readProducts() {
  const file = path.join(__dirname, "product.json");
  const stat = await fs.stat(file);
  const mtime = stat.mtimeMs;

  if (!PRODUCT_CACHE || mtime !== PRODUCT_MTIME) {
    const raw = await fs.readFile(file, "utf-8");
    PRODUCT_CACHE = JSON.parse(raw);
    PRODUCT_MTIME = mtime;
  }
  return PRODUCT_CACHE;
}

// ===========================
// 🔹 Product APIs
// ===========================
app.get("/api/products", async (req, res) => {
  try {
    const data = await readProducts();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Could not load products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const data = await readProducts();
    const item = data.find((p) => p.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Product not found" });
    res.json(item);
  } catch {
    res.status(500).json({ message: "Could not load product" });
  }
});

// 🔍 SEARCH API
app.get("/api/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase().trim();
    const data = await readProducts();

    if (!q) {
      return res.json(data);
    }

    const results = data.filter((p) => {
      const haystack = [
        p.title,
        p.brand,
        p.category,
        ...(p.tags || []),
        JSON.stringify(p.specs || {}),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    res.json(results);
  } catch (err) {
    console.error("❌ /api/search error:", err.message);
    res.status(500).json({ message: "Search failed" });
  }
});

// ===========================
// 🔹 Signup
// ===========================
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch {
    res.status(500).json({ message: "Signup failed" });
  }
});

// ===========================
// 🔹 Login
// ===========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

// ===========================
// 🔹 WISHLIST ROUTES
// ===========================
app.get("/api/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ wishlist: user.wishlist || [] });
  } catch {
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});

app.post("/api/wishlist", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist || [];

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({
      message: "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
});

app.delete("/api/wishlist/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = (user.wishlist || []).filter((id) => id !== productId);
    await user.save();

    res.json({
      message: "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
});

// ===========================
// 🔹 ADMIN ROUTES (REAL DATA)
// ===========================

// Live dashboard stats + tables
app.get("/api/admin/stats", auth, requireAdmin, async (req, res) => {
  try {
    // 1. Load all users (for counts + recent users + wishlist sums)
    const users = await User.find().select("name email createdAt wishlist");

    // 2. Load products from product.json
    const products = await readProducts();

    // 3. Totals
    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalWishlist = users.reduce((sum, u) => {
      return sum + (Array.isArray(u.wishlist) ? u.wishlist.length : 0);
    }, 0);

    // TODO: connect to real orders collection later
    const totalOrders = 0;

    // 4. Recent users (latest 5)
    const recentUsers = [...users]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        joined: u.createdAt,
      }));

    // 5. Featured products (first 5)
    const featuredProducts = products.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
    }));

    // 6. Shape expected by AdminDashboard.jsx
    res.json({
      stats: {
        users: totalUsers,
        products: totalProducts,
        wishlist: totalWishlist,
        orders: totalOrders,
      },
      recentUsers,
      featuredProducts,
    });
  } catch (err) {
    console.error("❌ /api/admin/stats error:", err.message);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// (Optional) separate recent users API – not required by dashboard but safe
app.get("/api/admin/users", auth, requireAdmin, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email createdAt");

    res.json({ users });
  } catch {
    res.status(500).json({ message: "Failed to load users" });
  }
});

// ===========================
// 🔹 Email Routes
// ===========================
app.post("/api/email/request-access", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      boutique,
      date,
      time,
      categories,
      message,
    } = req.body;

    if (!fullName || !email || !boutique || !date || !time) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const cats = Array.isArray(categories) ? categories.join(", ") : "None";

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: "New Exclusive Collection Request",
      html: `
        <h2>New Exclusive Access Request</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Boutique:</strong> ${boutique}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Categories:</strong> ${cats}</p>
        <p><strong>Special Request:</strong> ${message || "None"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent successfully!" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.post("/api/email/personal-concierge", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
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

    res.json({ success: true, message: "Concierge request sent successfully!" });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to send concierge email",
    });
  }
});

// ===========================
// 🔹 Test route
// ===========================
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// ===========================
// 🔹 Start server
// ===========================
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
}

startServer();

export default app;
