// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const TOKEN_KEY = "loopcart_token";
const USER_KEY = "loopcart_user";

export default function Navbar() {
  const [user, setUser] = useState(null);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Our Philosophy", to: "/philosophy" },
    { label: "Our Boutiques", to: "/boutiques" },
    { label: "Exclusive Collection", to: "/exclusive" },
    { label: "Contact", to: "/contact" },
  ];

  // Read user from localStorage on mount
  useEffect(() => {
    // Try new key first, then old key
    const raw =
      localStorage.getItem(USER_KEY) || localStorage.getItem("user") || null;

    if (!raw) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      console.log("Navbar detected logged-in user:", parsed);
      setUser(parsed);
    } catch (e) {
      console.error("Failed to parse stored user", e);
      setUser(null);
    }
  }, []);

  // Logout: clear everything and reload
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.svg" alt="LoopCart" className="h-6" />
          <span>LoopCart</span>
        </Link>

        {/* Center nav links */}
        <ul className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="text-sm text-gray-700 hover:text-purple-600"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: depends on login state */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            // ✅ Logged in — show icons + logout
            <>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FaUser />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)" }}
              >
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            // ❌ Not logged in — show Login / Sign Up
            <>
              <Link to="/login" className="text-sm">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: "linear-gradient(90deg,#ad39ff,#ff53b3)" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
