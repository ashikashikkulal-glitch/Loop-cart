// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const TOKEN_KEY = "loopcart_token";
const USER_KEY = "loopcart_user";

const Header = () => {
  const [user, setUser] = useState(null);

  // Read user from localStorage on mount
  useEffect(() => {
    const raw =
      localStorage.getItem(USER_KEY) || localStorage.getItem("user") || null;

    if (!raw) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      console.log("Header detected logged-in user:", parsed);
      setUser(parsed);
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth-related keys
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light shadow-sm fixed-top">
      <div className="container">
        <a className="navbar-brand fw-bold" href="#">
          LoopCart
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Left nav items */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#boutiques">
                Boutiques
              </a>
            </li>

            {/* ✅ NEW: Wishlist link goes to /wishlist */}
            <li className="nav-item">
              <a className="nav-link" href="/wishlist">
                Wishlist ❤️
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#contact">
                Contact
              </a>
            </li>
          </ul>

          {/* Right side: auth section */}
          <ul className="navbar-nav ms-3">
            {user ? (
              // ✅ Logged in: show user + logout
              <>
                <li className="nav-item d-flex align-items-center me-2">
                  <span className="nav-link d-flex align-items-center">
                    <FaUser className="me-1" />
                    {user.name}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-1" />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // ❌ Not logged in: show Login / Sign Up
              <>
                <li className="nav-item">
                  <a className="nav-link" href="#login">
                    Login
                  </a>
                </li>
                <li className="nav-item">
                  <a className="btn btn-primary btn-sm ms-1" href="#signup">
                    Sign Up
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
