import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

// ===========================
// 🔹 Load environment variables
// ===========================
dotenv.config();

const app = express();

// ===========================
// 🔹 Middleware
// ===========================
app.use(cors());
app.use(express.json()); // To parse JSON request body

// ===========================
// 🔹 SIGNUP Route
// ===========================
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ name, email, password: hashedPassword });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// ===========================
// 🔹 LOGIN Route
// ===========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ===========================
// 🔹 DEFAULT TEST ROUTE
// ===========================
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully!");
});

// ===========================
// 🔹 MONGO CONNECTION
// ===========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ===========================
// 🔹 START SERVER
// ===========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
