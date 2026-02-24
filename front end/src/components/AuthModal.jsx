// src/components/AuthModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AuthModal.css";

const API_BASE_URL = "http://localhost:5000/api";

const TOKEN_KEY = "loopcart_token";
const USER_KEY = "loopcart_user";

const AuthModal = ({
  mode = "login", // read desired mode from parent
  onClose = () => { },
  onAuthSuccess = () => { },
}) => {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // keep internal tab in sync if App changes mode
  useEffect(() => {
    setIsLogin(mode === "login");
  }, [mode]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login/signup submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.email || !formData.password) {
        alert("Please fill in all required fields");
        return;
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const endpoint = isLogin ? "/login" : "/signup";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      const { token, user } = res.data; // user should contain role from backend

      console.log("✅ Auth success:", { token, user });

      // Store token and user in localStorage
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem("token", token); // backward compatible
      }
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user)); // backward compatible
      }

      onAuthSuccess(user);
      alert(`${isLogin ? "Login" : "Signup"} successful!`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("❌ Auth error:", error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        {/* scrollable inner wrapper that matches AuthModal.css */}
        <div className="auth-modal-inner">
          <div className="auth-header">
            <h2>
              Welcome to <span>LoopCart</span>
            </h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="tab-container">
            <button
              className={`tab ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`tab ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="tab-content">
            {!isLogin && (
              <>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  onChange={handleChange}
                />
              </>
            )}

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder={
                isLogin ? "Enter your password" : "Create a password"
              }
              onChange={handleChange}
            />

            {!isLogin && (
              <>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  onChange={handleChange}
                />
                <div className="terms">
                  <input type="checkbox" />
                  <p>
                    I agree to the <a href="#">Terms of Service</a> and{" "}
                    <a href="#">Privacy Policy</a>
                  </p>
                </div>
              </>
            )}

            <button
              className="primary-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
            </button>

            <p className="switch-text">
              {isLogin
                ? "Don’t have an account?"
                : "Already have an account?"}{" "}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </div>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn">G</button>
            <button className="social-btn">f</button>
            <button className="social-btn"></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
