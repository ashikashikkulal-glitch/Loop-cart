// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import Hero from "./components/Hero";

import "./styles/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { FaAward, FaCertificate, FaMapMarkerAlt } from "react-icons/fa";

import Membership from "./components/Membership";
import AuthModal from "./components/AuthModal";
import PersonalConcierge from "./components/PersonalConcierge";
import Footer from "./components/Footer";

import SearchResults from "./components/SearchResults";
import ProductDetail from "./components/productDetail";
import UserProfile from "./components/UserProfile";
import ExclusiveAccess from "./components/ExclusiveAccess";
import WishlistPage from "./pages/WishlistPage";
import AdminDashboard from "./components/AdminDashboard";

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "Our Philosophy", id: "philosophy" },
  { label: "Our Boutiques", id: "boutiques" },
  { label: "Premium Membership", id: "paid-access" },
  { label: "Exclusive Collection", id: "exclusive" },
  { label: "Contact", id: "contact" },
];

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Home page sections
const HomePage = ({ isLoggedIn, onRequireLogin }) => (
  <>
    {/* Hero (search bar) */}
    <Hero isLoggedIn={isLoggedIn} onRequireLogin={onRequireLogin} />

    {/* Philosophy Section */}
    <section
      id="philosophy"
      className="py-5 text-center philosophy-section reveal"
    >
      <div className="container">
        <h2 className="fw-bold text-gradient mb-4">The LoopCart Philosophy</h2>
        <p className="mb-5 text-muted">
          We believe in extending the lifecycle of premium electronics through
          meticulous curation and exceptional service.
        </p>

        <div className="row justify-content-center">
          {[
            {
              icon: <FaAward size={32} color="#8b3ef6" />,
              title: "Exquisite Curation",
              text: "Each device hand-selected for exceptional quality and performance.",
              bg: "bg-light-purple",
            },
            {
              icon: <FaCertificate size={32} color="#e83e8c" />,
              title: "Certified Excellence",
              text: "Rigorous testing and certification by our master technicians.",
              bg: "bg-light-pink",
            },
            {
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="#4b49e6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.2" />
                  <path d="M6 16h12l-2-7-4 3-4-3-2 7z" />
                </svg>
              ),
              title: "Concierge Service",
              text: "White-glove experience from selection to aftercare.",
              bg: "bg-light-blue",
            },
          ].map((card, i) => (
            <div key={i} className="col-md-4 mb-4">
              <div className="p-4 rounded-4 bg-white shadow-sm h-100 philosophy-card hover-lift">
                <div className={`icon-circle ${card.bg} mb-3`}>{card.icon}</div>
                <h5>{card.title}</h5>
                <p className="text-muted">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Boutiques Section */}
    <section id="boutiques" className="py-5 boutiques-section bg-light reveal">
      <div className="container text-center">
        <h2 className="fw-bold text-gradient mb-4">Our Boutiques</h2>
        <p className="text-muted mb-5">
          Explore our exclusive partner boutiques offering premium certified
          pre-owned electronics near you.
        </p>

        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <div className="map-box shadow-sm rounded-4 overflow-hidden hover-lift">
              <iframe
                title="LoopCart Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3154.76920229489!2d-122.41941508468224!3d37.77492927975909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808a2f1a1a7d%3A0x6c5bde67afdc1e45!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1687845698123!5m2!1sen!2sus"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div className="col-md-6 text-start">
            <div className="boutique-list">
              {[
                {
                  name: "LoopCart Elite - Bengaluru",
                  address: "MG Road, Bengaluru, India",
                },
                {
                  name: "LoopCart Studio - Mumbai",
                  address: "Bandra West, Mumbai, India",
                },
                {
                  name: "LoopCart Premium - Delhi",
                  address: "Connaught Place, New Delhi",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="p-3 mb-3 bg-white rounded-4 shadow-sm boutique-card hover-lift"
                >
                  <h5 className="fw-bold d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    {b.name}
                  </h5>
                  <p className="text-muted mb-0">{b.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Exclusive Collection Section */}
    <ExclusiveAccess />

    {/* Premium Membership Section */}
    <section id="paid-access" className="py-5 reveal">
      <div className="container">
        <Membership />
      </div>
    </section>

    {/* Personal Concierge */}
    <section id="contact" className="py-5 reveal">
      <PersonalConcierge />
    </section>
  </>
);

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [activeId, setActiveId] = useState("home");

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load user + avatar from localStorage on mount
  useEffect(() => {
    const storedUser =
      localStorage.getItem("loopcart_user") || localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }

    const savedAvatar = localStorage.getItem("loopcart_avatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);

  // Listen for avatar updates from UserProfile
  useEffect(() => {
    const onAvatarUpdate = () => {
      const savedAvatar = localStorage.getItem("loopcart_avatar");
      setAvatar(savedAvatar || null);
    };

    window.addEventListener("avatar-updated", onAvatarUpdate);
    return () => window.removeEventListener("avatar-updated", onAvatarUpdate);
  }, []);

  // Lock page scroll while auth modal is open
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAuthModal]);

  // Close avatar drop-down when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClick = (e) => {
      const container = document.querySelector(".user-avatar-container");
      if (container && !container.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem("loopcart_token");
    localStorage.removeItem("loopcart_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setAvatar(null);
    setShowUserMenu(false);
    window.location.reload();
  };

  // Smooth scroll with offset for fixed navbar
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -90; // navbar height
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleNavClick = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 0);
    } else {
      scrollToSection(id);
    }
  };

  // Navbar shadow on scroll
  useEffect(() => {
    const nav = document.querySelector(".navbar");
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 6) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section highlight (only on /)
  const sectionIds = useMemo(() => NAV_ITEMS.map((n) => n.id), []);
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveId("");
      return;
    }
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const onScroll = () => {
      const offset = 120;
      let current = "home";
      for (const sec of sections) {
        const top = sec.getBoundingClientRect().top;
        if (top - offset <= 0) current = sec.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, sectionIds]);

  // Reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("revealed")
        ),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [location.pathname]);

  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const openLoginModal = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const isLoggedIn = !!user;

  // Admin detection – uses role and email (case-insensitive) as fallback
  const isAdmin =
    !!user &&
    (user.role?.toLowerCase() === "admin" ||
      user.email?.toLowerCase() === "star@test.com");

  return (
    <div className="loopcart-container">
      <ScrollToTop />

      {/* Navbar */}
      <nav className="navbar premium-navbar navbar-expand-lg fixed-top">
        <div className="container d-flex justify-content-between align-items-center">
          <a
            className="navbar-brand d-flex align-items-center"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
              setTimeout(() => scrollToSection("home"), 0);
            }}
          >
            <span className="logo-symbol">∞</span>
            <span className="logo-text ms-2">LoopCart</span>
          </a>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 nav-links">
            {NAV_ITEMS.map((item) => (
              <li className="nav-item" key={item.id}>
                <button
                  className={`nav-link btn btn-link ${
                    activeId === item.id ? "active" : ""
                  }`}
                  aria-current={activeId === item.id ? "page" : undefined}
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}

            {/* Wishlist link */}
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => navigate("/wishlist")}
              >
                Wishlist ❤️
              </button>
            </li>

            {/* Admin link only for admins */}
            {isAdmin && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </button>
              </li>
            )}
          </ul>

          {/* RIGHT SIDE: login / avatar */}
          <div className="d-flex align-items-center ms-3 position-relative user-avatar-container">
            {user ? (
              <>
                <button
                  type="button"
                  className="user-avatar-btn"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="User avatar"
                      className="navbar-avatar"
                    />
                  ) : (
                    avatarLetter
                  )}
                </button>

                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    {isAdmin && (
                      <button
                        className="user-menu-item"
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/admin");
                        }}
                      >
                        <span className="user-menu-icon">🛠</span>
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      className="user-menu-item"
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile");
                      }}
                    >
                      <span className="user-menu-icon">👤</span>
                      <span>My Profile</span>
                    </button>

                    <button
                      className="user-menu-item"
                      type="button"
                      onClick={handleLogout}
                    >
                      <span className="user-menu-icon">↩</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  className="navbar-login-btn me-2"
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                >
                  Login
                </button>
                <button
                  className="navbar-signup-btn"
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthModal(true);
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage isLoggedIn={isLoggedIn} onRequireLogin={openLoginModal} />
          }
        />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/wishlist" element={<WishlistPage />} />

        {/* Protected Admin route */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminDashboard currentUser={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      {/* Footer on all pages */}
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(u) => {
            if (u) setUser(u);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
