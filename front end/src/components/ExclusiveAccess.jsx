import React, { useState } from "react";
// ✅ CSS is in the same folder as this component
import "./ExclusiveAccess.css";

const ExclusiveAccess = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    boutique: "",
    date: "",
    time: "",
    categories: [],
    message: "", // FIXED (was specialRequest)
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => {
      if (prev.categories.includes(value)) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== value),
        };
      }
      return {
        ...prev,
        categories: [...prev.categories, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/email/request-access", // FIXED URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Your request has been sent successfully!");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          boutique: "",
          date: "",
          time: "",
          categories: [],
          message: "",
        });
      } else {
        alert("Error sending request: " + data.message);
      }
    } catch (err) {
      alert("Something went wrong! Check console.");
      console.error(err);
    }
  };

  return (
    <section id="exclusive-access" className="exclusive-access-section py-5">
      <div className="container text-center">
        <h2 className="fw-bold text-gradient mb-3">Exclusive Collection Access</h2>
        <p className="text-muted mb-5">
          Request a private viewing of our most sought-after devices
        </p>

        <div className="form-container mx-auto p-4 rounded-4 shadow-sm">
          <form className="exclusive-form" onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your phone"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Preferred Boutique</label>
                <select
                  name="boutique"
                  value={formData.boutique}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select location</option>
                  <option>Bengaluru</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Chennai</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Preferred Time</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select time</option>
                  <option>10:00 AM</option>
                  <option>12:00 PM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="checkbox-group text-start mt-4">
              <label className="form-label">Categories of Interest</label>
              <div className="d-flex flex-wrap gap-3">
                {[
                  "Smartphones",
                  "Laptops",
                  "Audio",
                  "Cameras",
                  "Tablets",
                  "Gaming",
                  "Wearables",
                  "Luxury Items",
                ].map((cat) => (
                  <label key={cat} className="form-check-label">
                    <input
                      type="checkbox"
                      value={cat}
                      checked={formData.categories.includes(cat)}
                      onChange={handleCategoryChange}
                      className="form-check-input me-2"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 text-start">
              <label className="form-label">Special Requests</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-control"
                placeholder="Specific models or features you're interested in..."
                rows="3"
              />
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-gradient px-4 py-2">
                Request Access
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ExclusiveAccess;
