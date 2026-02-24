import React, { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./Membership.css";

const Membership = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Basic",
      price: 29,
      features: [
        { text: "Access to standard collection", available: true },
        { text: "Monthly newsletter", available: true },
        { text: "Priority customer support", available: true },
        { text: "5% discount on purchases", available: true },
        { text: "Exclusive pre-orders", available: false },
        { text: "Personal concierge", available: false },
        { text: "VIP events access", available: false },
      ],
      buttonColor: "btn-outline-secondary",
    },
    {
      name: "Premium",
      price: 79,
      tag: "Popular",
      features: [
        { text: "Access to premium collection", available: true },
        { text: "Weekly insider updates", available: true },
        { text: "Priority customer support", available: true },
        { text: "15% discount on purchases", available: true },
        { text: "Exclusive pre-orders", available: true },
        { text: "Personal concierge", available: false },
        { text: "VIP events access", available: false },
      ],
      buttonColor: "btn-outline-danger",
    },
    {
      name: "Elite",
      price: 149,
      features: [
        { text: "Access to elite collection", available: true },
        { text: "Daily insider updates", available: true },
        { text: "24/7 dedicated support", available: true },
        { text: "25% discount on purchases", available: true },
        { text: "Exclusive pre-orders", available: true },
        { text: "Personal concierge", available: true },
        { text: "VIP events access", available: true },
      ],
      buttonColor: "btn-dark",
    },
  ];

  const scrollToForm = () => {
    const formSection = document.getElementById("membership-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 🔹 When user submits membership form, save demo membership in localStorage
  const handleCompleteMembership = (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      alert("Please select a membership plan first.");
      return;
    }

    const membership = {
      plan: selectedPlan,
      startedAt: new Date().toISOString(),
    };

    // Save for profile page
    localStorage.setItem("loopcart_membership", JSON.stringify(membership));

    alert(
      `Demo: ${selectedPlan} membership saved locally.\n(Real app would charge payment + save on backend.)`
    );

    setSelectedPlan(null);
  };

  return (
    <section id="paid-access" className="py-5 text-center membership-section">
      <div className="container">
        <h2 className="fw-bold text-gradient mb-4">Premium Membership</h2>
        <p className="text-muted mb-5">
          Unlock exclusive benefits and premium services with our paid access tiers.
        </p>

        {/* Pricing Cards */}
        <div className="row justify-content-center">
          {plans.map((plan, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div
                className={`p-4 rounded-4 shadow-sm h-100 position-relative ${
                  plan.name === "Premium" ? "border border-danger" : ""
                }`}
              >
                {plan.tag && (
                  <span className="badge bg-danger position-absolute top-0 end-0 m-3">
                    {plan.tag}
                  </span>
                )}
                <h5 className="fw-bold mb-2">{plan.name}</h5>
                <h2 className="text-dark">
                  ₹{plan.price}
                  <small className="text-muted fs-6">/month</small>
                </h2>

                <ul className="list-unstyled mt-3 mb-4 text-start">
                  {plan.features.map((f, i) => (
                    <li key={i} className="mb-2 d-flex align-items-center">
                      {f.available ? (
                        <FaCheck className="text-success me-2" />
                      ) : (
                        <FaTimes className="text-danger me-2" />
                      )}
                      <span
                        className={`${
                          f.available ? "" : "text-decoration-line-through text-muted"
                        }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn w-100 ${plan.buttonColor}`}
                  onClick={() => {
                    setSelectedPlan(plan.name);
                    scrollToForm();
                  }}
                >
                  Select {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form Section */}
        {selectedPlan && (
          <div
            id="membership-form"
            className="mt-5 p-4 rounded-4 shadow-sm bg-light text-start mx-auto"
            style={{ maxWidth: "700px" }}
          >
            <h4 className="fw-bold mb-1">Complete Your Membership</h4>
            <p className="text-muted mb-3">
              Selected Plan: <strong>{selectedPlan}</strong>
            </p>

            <form onSubmit={handleCompleteMembership}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" required />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" required>
                    <option>Select payment method</option>
                    <option>Credit Card</option>
                    <option>UPI</option>
                    <option>PayPal</option>
                  </select>
                </div>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="terms"
                  required
                />
                <label className="form-check-label" htmlFor="terms">
                  I agree to the{" "}
                  <a href="#">Membership Terms and Billing Policy</a>
                </label>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedPlan(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gradient">
                  Complete Membership
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Membership;
