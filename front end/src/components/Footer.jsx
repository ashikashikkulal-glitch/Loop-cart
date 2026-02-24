import React, { useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const subscribe = async () => {
    if (!email) return setMsg("Enter your email");

    try {
      const res = await axios.post("http://localhost:5000/api/subscribe", {
        email,
      });
      setMsg(res.data.message);
      setEmail("");
    } catch (err) {
      setMsg("Subscription failed. Try again.");
    }
  };

  return (
    <footer className="footer-dark mt-5 pt-5">
      <div className="container pb-4">
        <div className="row g-4">
          {/* Brand Section */}
          <div className="col-md-4">
            <div className="d-flex align-items-center mb-3">
              <span className="logo-symbol text-light fs-3">∞</span>
              <span className="logo-text ms-2 text-light fs-5">LoopCart</span>
              <span className="ms-2" role="img" aria-label="moon">
                🌙
              </span>
            </div>
            <p className="text-footer">
              The premier destination for curated pre-owned electronics of
              exceptional quality.
            </p>
          </div>

          {/* Explore Links */}
          <div className="col-6 col-md-2">
            <h6 className="text-white-50 mb-3">Explore</h6>
            <ul className="list-unstyled footer-links">
              <li><a href="#philosophy">Our Philosophy</a></li>
              <li><a href="#boutiques">Our Boutiques</a></li>
              <li><a href="#exclusive">Exclusive Collection</a></li>
              <li><a href="#paid-access">Premium Access</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-6 col-md-3">
            <h6 className="text-white-50 mb-3">Services</h6>
            <ul className="list-unstyled footer-links">
              <li><a href="#exclusive">Private Viewings</a></li>
              <li><a href="#paid-access">Authentication Services</a></li>
              <li><a href="#contact">Concierge Service</a></li>
              <li><a href="#paid-access">Aftercare Program</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-md-3">
            <h6 className="text-white-50 mb-3">Exclusive Updates</h6>
            <p className="text-footer mb-2">
              Receive invitations to private events and new collection previews
            </p>

            <div className="input-group newsletter-group">
              <input
                type="email"
                className="form-control newsletter-input"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-gradient newsletter-btn" onClick={subscribe}>
                <FaPaperPlane />
              </button>
            </div>

            <p className="text-success mt-2">{msg}</p>
          </div>
        </div>

        <hr className="footer-divider my-4" />

        {/* Bottom bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pb-2 text-footer">
          <div>© 2025 LoopCart. All rights reserved.</div>

          <div className="d-flex gap-3">
            <a href="#" className="text-footer">Privacy Policy</a>
            <a href="#" className="text-footer">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;