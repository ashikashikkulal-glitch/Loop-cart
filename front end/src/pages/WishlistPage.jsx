// src/pages/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("loopcart_token") ||
    localStorage.getItem("token");

  // ===============================
  // STEP 1: Load Wishlist IDs
  // ===============================
  const loadWishlist = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data.message);
        return;
      }

      const wishlistIds = data.wishlist;

      // ===============================
      // STEP 2: Load ALL products
      // ===============================
      const productsRes = await fetch(
        "http://localhost:5000/api/products"
      );
      const productsData = await productsRes.json();

      // ===============================
      // STEP 3: Filter wishlist products
      // ===============================
      const filtered = productsData.filter((p) =>
        wishlistIds.includes(p.id)
      );

      setProducts(filtered);
    } catch (err) {
      console.error("Wishlist load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadWishlist();
    else setLoading(false);
  }, []);

  if (!token) {
    return (
      <div className="container py-5">
        <h2 className="mb-3">Your Wishlist</h2>
        <p className="text-muted">Please log in to view wishlist.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <h2 className="mb-3">Your Wishlist</h2>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-bold">Your Wishlist</h2>

      {products.length === 0 ? (
        <p className="text-muted">
          You have no items in your wishlist yet.
        </p>
      ) : (
        <div className="row g-4">
          {products.map((p) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
