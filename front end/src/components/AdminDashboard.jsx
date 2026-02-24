// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const AdminDashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    wishlist: 0,
    orders: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("loopcart_token") ||
          localStorage.getItem("token");

        if (!token) {
          setError("Missing auth token – please log in again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Admin stats response:", res.data);

        setStats(res.data.stats || {});
        setRecentUsers(res.data.recentUsers || []);
        setFeaturedProducts(res.data.featuredProducts || []);
      } catch (err) {
        console.error("❌ Failed to load admin stats:", err);
        if (err.response?.status === 403) {
          setError("You are not allowed to view this page (admin only).");
        } else {
          setError(err.response?.data?.message || "Failed to load admin data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold">Admin Dashboard</h2>
        <p className="text-muted mb-1">
          Welcome back, <strong>{currentUser?.name || "Admin"}</strong>. Here’s
          a live overview of LoopCart activity.
        </p>
        <span className="badge rounded-pill bg-light text-dark px-3 py-2 mt-2">
          ⚙ Admin mode
        </span>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card h-100 shadow-sm rounded-4 p-3">
            <p className="text-muted mb-1">Users</p>
            <h3 className="fw-bold mb-1">
              {loading ? "…" : stats.users ?? 0}
            </h3>
            <small className="text-muted">Total registered users</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100 shadow-sm rounded-4 p-3">
            <p className="text-muted mb-1">Products</p>
            <h3 className="fw-bold mb-1">
              {loading ? "…" : stats.products ?? 0}
            </h3>
            <small className="text-muted">Items in catalogue</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100 shadow-sm rounded-4 p-3">
            <p className="text-muted mb-1">Wishlisted</p>
            <h3 className="fw-bold mb-1">
              {loading ? "…" : stats.wishlist ?? 0}
            </h3>
            <small className="text-muted">Total wishlist saves</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100 shadow-sm rounded-4 p-3">
            <p className="text-muted mb-1">Orders</p>
            <h3 className="fw-bold mb-1">
              {loading ? "…" : stats.orders ?? 0}
            </h3>
            <small className="text-muted">Completed transactions</small>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="row g-4">
        {/* Recent users */}
        <div className="col-md-6">
          <div className="card shadow-sm rounded-4 p-3 h-100">
            <h5 className="mb-3">Recent Users</h5>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-muted">
                        Loading…
                      </td>
                    </tr>
                  ) : recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-muted">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td className="text-muted">{u.email}</td>
                        <td className="text-muted">
                          {new Date(u.joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Featured products */}
        <div className="col-md-6">
          <div className="card shadow-sm rounded-4 p-3 h-100">
            <h5 className="mb-3">Featured Products</h5>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Brand</th>
                    <th scope="col">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-muted">
                        Loading…
                      </td>
                    </tr>
                  ) : featuredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-muted">
                        No products in catalogue.
                      </td>
                    </tr>
                  ) : (
                    featuredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.title}</td>
                        <td className="text-muted">{p.brand}</td>
                        <td className="text-muted">{p.category}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <small className="text-muted mt-2 d-block">
              These are live products from <code>product.json</code>. When you
              update the file, this table updates automatically.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
