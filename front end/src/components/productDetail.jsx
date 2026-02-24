// src/components/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchProductById, imageUrl } from "../utils/api";

export default function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefer full raw backend product if passed via Link state
  let productFromState = location.state?.product || null;
  if (productFromState && productFromState.raw) {
    productFromState = productFromState.raw;
  }

  const [product, setProduct] = useState(productFromState || null);
  const [loading, setLoading] = useState(!productFromState);
  const [error, setError] = useState("");

  // If we don't have a complete product (images/specs) fetch it
  useEffect(() => {
    const incomplete =
      !product ||
      !product.specs ||
      !Array.isArray(product.images) ||
      product.images.length === 0;

    if (!incomplete) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProductById(decodeURIComponent(id));
        if (!cancelled) setProduct(data || {});
      } catch (err) {
        console.error("Detail fetch error", err);
        if (!cancelled) setError("Unable to load product details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, product]);

  // Build safe maps url (avoids broken Firebase short links)
  function buildMapsUrl(store = {}) {
    const maps = (store?.maps || "").trim();
    if (maps && /^https?:\/\//i.test(maps) && !maps.includes("xxxxx")) {
      return maps;
    }
    const address = (store?.address || "").trim();
    if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    const name = (store?.name || "LoopCart").trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  }

  // Normalize product for UI
  const normalized = useMemo(() => {
    const p = product || {};

    const title = p.title || "Untitled product";
    const brand = p.brand || "";
    const category = p.category || "";

    // Price -> number or null
    let price = null;
    if (typeof p.price === "number") price = p.price;
    else if (typeof p.price === "string") {
      const n = Number(String(p.price).replace(/[^\d.]/g, ""));
      price = Number.isFinite(n) ? n : null;
    }

    // Images -> use imageUrl and ensure at least one placeholder
    let images = Array.isArray(p.images) ? p.images.slice() : [];
    images = images.filter(Boolean).map((src) => imageUrl(src));
    if (images.length === 0) {
      images = [imageUrl("/images/placeholder.jpg")];
    } else {
      // cap to 4
      images = images.slice(0, 4);
    }

    // Specs: prefer provided specs; keep "Not specified" fallback
    const specs = {
      processor: p.specs?.processor || "Not specified",
      ram: p.specs?.ram || "Not specified",
      storage: p.specs?.storage || "Not specified",
      camera: p.specs?.camera || "Not specified",
      display: p.specs?.display || "Not specified",
      battery: p.specs?.battery || "Not specified",
    };

    const description = p.details || p.description || `Premium pre-owned ${title}.`;
    const conditionText = p.condition || "Certified Pre-Owned";

    const age = p.age || "Not specified";
    const usage = p.usage || "Not specified";
    const warranty = p.warranty || "Not specified";

    const store = {
      name: p.store?.name || "LoopCart – Mangaluru",
      owner: p.store?.owner || "Store Owner",
      phone: p.store?.phone || "+91 90000 00000",
      address: p.store?.address || "Mangaluru, Karnataka",
      maps: p.store?.maps || null,
    };

    const highlights = (() => {
      if (p.details) {
        return p.details
          .split(/[.,]/)
          .map((x) => x.trim())
          .filter((x) => x.length > 2);
      }
      // fallback to key specs
      return [
        specs.processor,
        specs.display,
        specs.camera,
        specs.ram,
        specs.storage,
        specs.battery,
      ].filter((x) => x && x !== "Not specified");
    })();

    return {
      id: p.id || id,
      title,
      brand,
      category,
      price,
      images,
      specs,
      description,
      conditionText,
      age,
      usage,
      warranty,
      store,
      highlights,
      mapsUrl: buildMapsUrl(store),
    };
  }, [product, id]);

  const {
    title,
    brand,
    category,
    price,
    images,
    specs,
    description,
    conditionText,
    age,
    usage,
    warranty,
    store,
    highlights,
    mapsUrl,
  } = normalized;

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setActiveIdx(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [normalized.id]);

  // image onError handler to swap to placeholder (keeps UI neat)
  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = imageUrl("/images/placeholder.jpg");
  };

  if (loading)
    return <section className="container py-5 text-center">Loading...</section>;

  if (error)
    return (
      <section className="container py-5 text-center text-danger">
        {error}
      </section>
    );

  return (
    <section className="container py-4" style={{ maxWidth: 1100 }}>
      <button
        className="btn btn-outline-premium mb-3"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ← Back
      </button>

      <div className="row g-4">
        {/* LEFT — IMAGE GALLERY */}
        <div className="col-md-6">
          <div className="bg-white rounded-4 shadow-sm p-3">
            <img
              src={images[activeIdx]}
              alt={`${title} photo ${activeIdx + 1}`}
              className="w-100 rounded-3"
              style={{ height: 380, objectFit: "cover" }}
              onError={handleImgError}
            />

            <div className="d-flex gap-2 mt-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`p-0 border-0 rounded-3 ${
                    i === activeIdx ? "outline-selected" : ""
                  }`}
                  style={{ background: "transparent" }}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img
                    src={src}
                    alt={`thumbnail ${i + 1}`}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                    onError={handleImgError}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — DETAILS */}
        <div className="col-md-6">
          <div className="bg-white rounded-4 shadow-sm p-4">
            <h3>{title}</h3>
            <div className="text-muted mb-2">
              {brand} {category && `• ${category}`}
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="fs-4 fw-bold">
                {price ? `₹${price.toLocaleString()}` : "Price on request"}
              </span>
              <span className="badge text-bg-light">{conditionText}</span>
            </div>

            {/* SPECS */}
            <h6 className="mt-4">Technical Specifications</h6>
            <div className="row gy-2 mt-1" style={{ fontSize: 14 }}>
              <div className="col-6 text-muted">Processor</div>
              <div className="col-6">{specs.processor}</div>

              <div className="col-6 text-muted">RAM</div>
              <div className="col-6">{specs.ram}</div>

              <div className="col-6 text-muted">Storage</div>
              <div className="col-6">{specs.storage}</div>

              <div className="col-6 text-muted">Camera</div>
              <div className="col-6">{specs.camera}</div>

              <div className="col-6 text-muted">Display</div>
              <div className="col-6">{specs.display}</div>

              <div className="col-6 text-muted">Battery</div>
              <div className="col-6">{specs.battery}</div>
            </div>

            {/* AGE / USAGE */}
            <h6 className="mt-4">Age / Usage</h6>
            <div className="fw-semibold">Age: {age}</div>
            <div className="fw-semibold">Usage: {usage}</div>
            <div className="fw-semibold">Warranty: {warranty}</div>

            {/* HIGHLIGHTS */}
            {highlights.length > 0 && (
              <>
                <h6 className="mt-4">Key Features</h6>
                <ul className="mt-2 text-muted">
                  {highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </>
            )}

            {/* DESCRIPTION */}
            <p className="text-muted mt-3">{description}</p>

            {/* STORE INFO */}
            <h6 className="mt-4">Available at</h6>
            <div className="p-3 rounded-3" style={{ background: "#f8f7ff" }}>
              <div className="fw-semibold">{store.name}</div>
              <div className="small text-muted">{store.address}</div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-premium mt-2"
              >
                View on Map
              </a>

              <div className="small mt-3">
                Owner: <strong>{store.owner}</strong>
                <br />
                Phone: <a href={`tel:${store.phone}`}>{store.phone}</a>
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button className="btn btn-gradient">Reserve / Enquire</button>
              <button
                className="btn btn-outline-premium"
                onClick={() => navigate("/search")}
              >
                Back to Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
