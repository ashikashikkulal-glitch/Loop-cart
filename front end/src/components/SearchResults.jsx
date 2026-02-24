// src/components/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchProducts } from "../utils/api";
import ProductCard from "./ProductCard";

export default function SearchResults() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = (searchParams.get("q") || "").trim();

  // Clean & simple normalization (NO placeholder)
  const normalize = (item) => {
    const title = item.title || item.name || item.model || "Untitled product";
    const brand = item.brand || item.make || item.specs?.brand || "";
    const category = item.category || item.type || "";

    const id =
      item.id ||
      item._id ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);

    // Use backend real images
    const img =
      item.thumbnail ||
      item.image ||
      item.img ||
      null;

    let price = null;
    if (typeof item.price === "number") price = item.price;
    else if (typeof item.price === "string")
      price = Number(item.price.replace(/[^\d]/g, ""));

    const condition = item.condition || item.grade || "";

    return {
      id,
      title,
      brand,
      category,
      price,
      condition,
      thumbnail: img,
      image: img,
      img,
      images: item.images || [],
      raw: item,
    };
  };

  // Load search results when q changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!q) {
      setItems([]);
      setErr("");
      return;
    }

    let stop = false;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const data = await searchProducts(q);
        const list = Array.isArray(data) ? data : data?.items || [];
        if (!stop) setItems(list.map(normalize));
      } catch (e) {
        console.error("Search error:", e);
        if (!stop) setErr("Something went wrong. Please try again.");
      } finally {
        if (!stop) setLoading(false);
      }
    })();

    return () => {
      stop = true;
    };
  }, [q]);

  // Submit new search
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = (form.get("q") || "").trim();
    navigate(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  };

  return (
    <section className="container py-5" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">
          Results {q && <>for “{q}”</>}{" "}
          {!loading && !err && q && items.length > 0 && (
            <small className="text-muted">({items.length})</small>
          )}
        </h4>

        {/* Search Again */}
        <form className="d-flex gap-2" onSubmit={handleSubmit}>
          <input
            name="q"
            defaultValue={q}
            className="form-control"
            placeholder="Search again…"
            style={{ maxWidth: 320 }}
          />
          <button className="btn btn-gradient" type="submit">
            Search
          </button>
        </form>
      </div>

      {/* Empty query */}
      {!q && (
        <div className="text-center text-muted py-5">
          Type something to search (e.g., “iPhone”, “MacBook”, “Camera”).
        </div>
      )}

      {/* Loading */}
      {q && loading && (
        <div className="py-4">
          <div className="row g-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card rounded-4 border-0">
                  <div className="skeleton skel-img" />
                  <div className="p-3">
                    <div className="skeleton skel-line w-60" />
                    <div className="skeleton skel-line w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {q && !loading && err && (
        <div className="text-center text-warning py-5">{err}</div>
      )}

      {/* No results */}
      {q && !loading && !err && items.length === 0 && (
        <div className="text-center text-muted py-5">
          No items found for “{q}”.
        </div>
      )}

      {/* Results */}
      {!loading && !err && items.length > 0 && (
        <div className="row g-3">
          {items.map((p) => (
            <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
