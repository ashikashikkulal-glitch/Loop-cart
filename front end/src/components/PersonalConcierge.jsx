import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaRegClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const PersonalConcierge = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/email/personal-concierge",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Backend error:", res.status, errData);
        alert(errData.message || "Server error. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      alert(data.message || "Request sent!");

      // Clear inputs after success
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send request. Please try again.");
    }

    setLoading(false);
  };

  return (
    <section id="contact" className="py-5">
      <div className="container">
        <h2 className="text-center fw-bold text-gradient mb-2">
          Personal Concierge
        </h2>
        <p className="text-center text-muted mb-4">
          Our specialists are ready to assist with your exclusive requirements
        </p>

        <div className="row g-4 align-items-start">
          {/* Left: Contact info */}
          <div className="col-lg-5">
            <h5 className="mb-3">Contact Information</h5>

            <ul className="list-unstyled mb-4 contact-list">
              <li className="d-flex align-items-start mb-3">
                <span className="contact-icon me-3">
                  <FaMapMarkerAlt />
                </span>
                <span>123 MG Road, Bangalore, Karnataka 560001</span>
              </li>
              <li className="d-flex align-items-start mb-3">
                <span className="contact-icon me-3">
                  <FaPhoneAlt />
                </span>
                <span>8088468288</span>
              </li>
              <li className="d-flex align-items-start mb-3">
                <span className="contact-icon me-3">
                  <FaEnvelope />
                </span>
                <span>loopcart@gmail.com</span>
              </li>
              <li className="d-flex align-items-start">
                <span className="contact-icon me-3">
                  <FaRegClock />
                </span>
                <span>By Appointment Only</span>
              </li>
            </ul>

            <div>
              <p className="mb-2 fw-semibold">Follow Our Journey</p>
              <div className="d-flex gap-2">
                <a className="social-btn" href="#"><FaFacebookF /></a>
                <a className="social-btn" href="#"><FaTwitter /></a>
                <a className="social-btn" href="#"><FaInstagram /></a>
                <a className="social-btn" href="#"><FaLinkedinIn /></a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="col-lg-7">
            <div className="p-4 rounded-4 concierge-card">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    className="form-control"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    name="subject"
                    className="form-control"
                    placeholder="What’s this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    rows="5"
                    className="form-control"
                    placeholder="Tell us how we can help"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button className="btn btn-gradient w-100" disabled={loading}>
                  {loading ? "Sending..." : "Request Consultation"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalConcierge;
