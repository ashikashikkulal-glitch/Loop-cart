// src/components/ProductCard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

const TOKEN_KEY = "loopcart_token";

// Convert backend paths correctly
function normalizeImagePath(src) {
  if (!src) return null;

  const s = String(src).trim();
  if (!s) return null;

  // Remote URLs untouched
  if (/^https?:\/\//i.test(s)) return s;

  // Already absolute (/images/iphone16/1.jpg)
  if (s.startsWith("/")) return s;

  // Convert relative → absolute
  return "/" + s.replace(/^\.?\/+/, "");
}

export default function ProductCard({ p = {} }) {
  const title = p.title || p.name || p.model || "Untitled product";
  const brand = p.brand || p.make || p.specs?.brand || "";
  const category = p.category || p.type || "";

  const rawId =
    p.id ||
    p._id ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);

  let price = null;
  if (typeof p.price === "number") price = p.price;
  else if (typeof p.price === "string")
    price = Number(p.price.replace(/[^\d.]/g, ""));

  const condition = p.condition || p.grade || "";

  // images
  let images = [];
  if (Array.isArray(p.images) && p.images.length) {
    images = p.images.map(normalizeImagePath).filter(Boolean);
  }
  const img = images[0] || null;

  const normalized = {
    ...p,
    id: rawId,
    title,
    brand,
    category,
    price,
    condition,
    images,
    img,
    thumbnail: img,
    image: img,
  };

  const clampTitle = (t, max = 78) =>
    t.length > max ? `${t.slice(0, max - 1)}…` : t;

  // =========================
  // Wishlist UI state
  // =========================
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Load initial wishlisted state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("loopcart_wishlist_ids");
      if (!raw) return;

      const ids = JSON.parse(raw);
      if (Array.isArray(ids) && ids.includes(rawId)) {
        setIsWishlisted(true);
      }
    } catch {
      // ignore parse errors
    }
  }, [rawId]);

  const updateLocalWishlistIds = (fn) => {
    try {
      const raw = localStorage.getItem("loopcart_wishlist_ids");
      const current = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
      const updated = fn(current);
      localStorage.setItem("loopcart_wishlist_ids", JSON.stringify(updated));
    } catch {
      // if anything wrong, just reset
      const updated = fn([]);
      localStorage.setItem("loopcart_wishlist_ids", JSON.stringify(updated));
    }
  };

  const handleWishlistClick = async (e) => {
    // prevent navigation when clicking heart
    e.preventDefault();
    e.stopPropagation();

    const token =
      localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");

    if (!token) {
      alert("Please login to use wishlist.");
      return;
    }

    try {
      if (!isWishlisted) {
        // add
        const res = await fetch("http://localhost:5000/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: rawId }),
        });

        if (!res.ok) throw new Error("Failed to add to wishlist");

        updateLocalWishlistIds((arr) =>
          arr.includes(rawId) ? arr : [...arr, rawId]
        );
        setIsWishlisted(true);
      } else {
        // remove
        const res = await fetch(
          `http://localhost:5000/api/wishlist/${encodeURIComponent(rawId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to remove from wishlist");

        updateLocalWishlistIds((arr) => arr.filter((id) => id !== rawId));
        setIsWishlisted(false);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      alert("Could not update wishlist. Please try again.");
    }
  };

  return (
    <Link
      to={`/product/${encodeURIComponent(rawId)}`}
      state={{ product: normalized }}
      className="text-decoration-none"
    >
      <div className="card h-100 bg-white text-dark rounded-4 border-0 shadow-sm hover-lift position-relative">
        {/* ❤️ Wishlist icon */}
        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistClick}
        >
          <FaHeart />
        </button>

        <img
          src={img}
          alt={title}
          className="w-100 rounded-top-4"
          style={{ height: 180, objectFit: "cover" }}
          loading="lazy"
        />

        <div className="p-3">
          <h6 className="mb-1 text-dark" style={{ lineHeight: 1.35 }}>
            {clampTitle(title)}
          </h6>

          {(brand || category) && (
            <small className="text-muted d-block mb-2">
              {brand}
              {brand && category ? " • " : ""}
              {category}
            </small>
          )}

          <div className="d-flex align-items-center justify-content-between">
            <span className="fw-bold text-dark">
              {price ? `₹${price.toLocaleString()}` : "Price on request"}
            </span>
            {condition && (
              <span className="badge text-bg-light">{condition}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
