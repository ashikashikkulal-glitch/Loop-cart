import React from "react";

export default function Dashboard({ stats = {}, onFilter }) {
  return (
    <section className="container py-5">
      {/* KPIs */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Items", value: stats.total ?? "—" },
          { label: "Avg Price", value: stats.avgPrice ? `₹${stats.avgPrice.toLocaleString()}` : "—" },
          { label: "In Stock", value: stats.inStock ?? "—" },
          { label: "New Today", value: stats.newToday ?? "—" },
        ].map((k,i)=>(
          <div key={i} className="col-6 col-md-3">
            <div className="card hover-lift has-glow">
              <div className="text-muted">{k.label}</div>
              <div className="fs-4 fw-bold mt-1">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Search…" onChange={(e)=>onFilter({q:e.target.value})} />
          </div>
          <div className="col-md-3">
            <select className="form-select" onChange={(e)=>onFilter({cat:e.target.value})}>
              <option value="">All categories</option>
              <option>Smartphones</option><option>Laptops</option>
              <option>Audio</option><option>Gaming</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" onChange={(e)=>onFilter({sort:e.target.value})}>
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-gradient">Apply</button>
          </div>
        </div>
      </div>

      {/* Results - you can mount your existing grid here */}
      <div id="results-mount"></div>
    </section>
  );
}
