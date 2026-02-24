// back end/controllers/authController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Helper to create JWT (keeps controller tidy)
 */
function createToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: "7d" });
}

/**
 * @desc User Signup
 * @route POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const rawName = req.body.name;
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    // basic validation
    if (!rawName || !rawEmail || !rawPassword) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const name = String(rawName).trim();
    const email = String(rawEmail).trim().toLowerCase();
    const password = String(rawPassword);

    // check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      // 409 is more semantically correct, but keep 400-compatible message if frontend expects it
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Create user — password hashing handled by user model pre-save hook (if present)
    const user = new User({ name, email, password });
    await user.save();

    // create token
    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);

    // handle duplicate-key race or validation errors more clearly
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ message: "Email already registered" });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ message: messages });
    }

    return res.status(500).json({ message: "Server error during signup" });
  }
};

/**
 * @desc User Login
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    if (!rawEmail || !rawPassword) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const email = String(rawEmail).trim().toLowerCase();
    const password = String(rawPassword);

    // Ensure password is selected; many schemas mark password select: false
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use model's comparePassword if available, otherwise fallback to bcrypt.compare
    let isValid = false;
    if (typeof user.comparePassword === "function") {
      try {
        isValid = await user.comparePassword(password);
      } catch (e) {
        console.warn("comparePassword threw, falling back to bcrypt:", e);
        isValid = await bcrypt.compare(password, user.password || "");
      }
    } else {
      // Fallback: bcrypt compare using stored hash
      isValid = await bcrypt.compare(password, user.password || "");
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);

    // return user (don't return password)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};
