// src/components/Hero.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaStore,
  FaCrown,
  FaSpinner,
  FaTimes,
  FaHistory,
  FaTrash,
} from "react-icons/fa";

import "../styles/HeroPremium.css";   // 👈 NEW: premium recent-search styles

const RECENT_KEY = "lc_recent_searches";
const MAX_RECENTS = 6;

// Accept props from App: isLoggedIn + onRequireLogin
const Hero = ({ isLoggedIn, onRequireLogin }) => {
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState([]);
  const [showRecents, setShowRecents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches at mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(saved)) setRecents(saved.slice(0, MAX_RECENTS));
    } catch {
      /* ignore */
    }
  }, []);

  // "/" to focus search
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowRecents(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close recents on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setShowRecents(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const saveRecent = (term) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(
      0,
      MAX_RECENTS
    );
    setRecents(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  };

  const removeRecent = (term) => {
    const next = recents.filter((r) => r !== term);
    setRecents(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const clearAllRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  // Ensure user is logged in before searching
  const ensureLoggedIn = () => {
    if (isLoggedIn) return true;
    if (onRequireLogin) onRequireLogin(); // opens login modal
    return false;
  };

  // Navigate to /search?q=...
  const goToResults = (term) => {
    const q = term.trim();
    if (!q) return;

    // Block search if not logged in
    if (!ensureLoggedIn()) return;

    saveRecent(q);
    setShowRecents(false);
    setSubmitting(true);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setTimeout(() => setSubmitting(false), 200);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    goToResults(query);
  };

  const runChip = (text) => {
    setQuery(text);
    inputRef.current?.focus();
    goToResults(text);
  };

  const clearSearch = () => {
    setQuery("");
    setShowRecents(true);
    inputRef.current?.focus();
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setShowRecents(false);
    }
  };

  return (
    <section id="home" className="hero-section text-center text-light">
      <div className="container-narrow py-5">
        {/* Title */}
        <h1 className="hero-title">Curated Pre-Owned Electronics</h1>
        <p className="hero-subtitle">
          Discover exceptional devices with timeless value
        </p>

        {/* Search */}
        <form
          className="search-box mt-4 d-flex justify-content-center"
          onSubmit={handleSubmit}
          role="search"
          aria-busy={submitting}
          ref={wrapperRef}
        >
          <div className="input-group" style={{ position: "relative" }}>
            <input
              ref={inputRef}
              type="text"
              className="form-control search-input"
              placeholder='Search for devices, brands, or categories…  (Press "/" to focus)'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowRecents(true);
              }}
              onFocus={() => setShowRecents(true)}
              onKeyDown={onInputKeyDown}
              aria-label="Search products"
              autoComplete="off"
            />

            {/* Clear button (when text exists) */}
            {query && (
              <button
                type="button"
                className="btn"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear"
                style={{
                  position: "absolute",
                  right: 62,
                  zIndex: 2,
                  height: "100%",
                }}
              >
                <FaTimes />
              </button>
            )}

            <button
              className="btn btn-search"
              type="submit"
              disabled={submitting}
              aria-label="Search"
              title="Search"
            >
              {submitting ? <FaSpinner className="spin" /> : <FaSearch />}
            </button>

            {/* PREMIUM Recent searches dropdown */}
            {showRecents && (
              <div
                className="recent-box"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
                role="listbox"
                aria-label="Recent searches"
              >
                {/* Header */}
                <div className="recent-header">
                  <div className="recent-title">
                    <FaHistory className="me-2" />
                    Recent Searches
                  </div>
                  {recents.length > 0 && (
                    <button
                      type="button"
                      className="clear-btn"
                      onClick={clearAllRecents}
                      title="Clear all"
                    >
                      <FaTrash /> Clear all
                    </button>
                  )}
                </div>

                {/* Items / Empty */}
                {recents.length === 0 ? (
                  <div className="px-3 py-3 small text-muted">
                    No recent searches yet.
                  </div>
                ) : (
                  recents.map((r) => (
                    <div
                      key={r}
                      className="recent-item"
                      role="option"
                      aria-selected="false"
                      onClick={() => goToResults(r)}
                    >
                      <div className="recent-text">
                        <FaHistory className="opacity-75" />
                        {r}
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering search
                          removeRecent(r);
                        }}
                        aria-label={`Remove ${r} from history`}
                        title="Remove"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </form>

        {/* Category chips */}
        <div className="categories mt-4">
          {["iPhone", "MacBook", "Sony", "Gaming"].map((item) => (
            <button
              key={item}
              className="category-btn"
              onClick={() => runChip(item)}
              disabled={submitting}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="cta-row">
          <a href="#exclusive" className="btn btn-gradient">
            <FaCrown className="me-2" /> Explore Collection
          </a>
          <a href="#boutiques" className="btn btn-outline-premium">
            <FaStore className="me-2" /> Visit Boutiques
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
