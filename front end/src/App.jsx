import React, { useState } from "react";
import "./styles/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaSearch,
  FaCrown,
  FaStore,
  FaAward,
  FaCertificate,
  FaMapMarkerAlt,
} from "react-icons/fa";

import Membership from "./components/Membership";
import AuthModal from "./components/AuthModal"; // ✅ new import

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"

  // ✅ Smooth scroll with offset for fixed navbar
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const yOffset = -90; // matches navbar height
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="loopcart-container">
      {/* ✅ Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <span className="logo-symbol">∞</span>
            <span className="logo-text ms-2">LoopCart</span>
            <span className="moon-icon ms-2">🌙</span>
          </a>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 nav-links">
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("home")}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("philosophy")}
              >
                Our Philosophy
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("boutiques")}
              >
                Our Boutiques
              </button>
            </li>
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => scrollToSection("paid-access")}
              >
                Paid Access
              </button>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Insider Access
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Contact
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center ms-3">
            <button
              className="btn btn-outline-light login-btn me-2"
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
            >
              Login
            </button>
            <button
              className="btn btn-gradient"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ Hero Section */}
      <section className="hero-section text-center text-light" id="home">
        <div className="container py-5">
          <h1 className="hero-title">Curated Pre-Owned Electronics</h1>
          <p className="hero-subtitle">
            Discover exceptional devices with timeless value
          </p>

          {/* Search Box */}
          <div className="search-box mt-4">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search for devices, brands, or categories..."
            />
            <button className="search-btn">
              <FaSearch />
            </button>
          </div>

          {/* Categories */}
          <div className="categories mt-4">
            {["iPhone", "MacBook", "Sony", "Gaming"].map((cat) => (
              <span key={cat} className="category-btn">
                {cat}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-5">
            <button
              className="btn btn-gradient me-3"
              onClick={() => scrollToSection("boutiques")}
            >
              <FaStore className="me-2" /> Visit Boutiques
            </button>
            <button
              className="btn btn-outline-premium"
              onClick={() => scrollToSection("paid-access")}
            >
              <FaCrown className="me-2" /> Premium Access
            </button>
          </div>
        </div>
      </section>

      {/* ✅ Philosophy Section */}
      <section id="philosophy" className="py-5 text-center philosophy-section">
        <div className="container">
          <h2 className="fw-bold text-gradient mb-4">
            The LoopCart Philosophy
          </h2>
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
                icon: <FaCrown size={32} color="#4b49e6" />,
                title: "Concierge Service",
                text: "White-glove experience from selection to aftercare.",
                bg: "bg-light-blue",
              },
            ].map((card, i) => (
              <div key={i} className="col-md-4 mb-4">
                <div className="p-4 rounded-4 bg-white shadow-sm h-100 philosophy-card">
                  <div className={`icon-circle ${card.bg} mb-3`}>
                    {card.icon}
                  </div>
                  <h5>{card.title}</h5>
                  <p className="text-muted">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Our Boutiques Section */}
      <section id="boutiques" className="py-5 boutiques-section bg-light">
        <div className="container text-center">
          <h2 className="fw-bold text-gradient mb-4">Our Boutiques</h2>
          <p className="text-muted mb-5">
            Explore our exclusive partner boutiques offering premium certified
            pre-owned electronics near you.
          </p>

          {/* Boutique Map */}
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <div className="map-box shadow-sm rounded-4 overflow-hidden">
                <iframe
                  title="LoopCart Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3154.76920229489!2d-122.41941508468224!3d37.77492927975909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808a2f1a1a7d%3A0x6c5bde67afdc1e45!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1687845698123!5m2!1sen!2sus"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen=""
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
                    address: "Connaught Place, New Delhi, India",
                  },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="p-3 mb-3 bg-white rounded-4 shadow-sm boutique-card"
                  >
                    <h5 className="fw-bold">
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

      {/* ✅ Paid Access Section */}
      <Membership />

      {/* ✅ Login / Sign Up Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default App;
