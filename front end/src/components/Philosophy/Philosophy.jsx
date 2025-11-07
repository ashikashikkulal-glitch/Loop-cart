import React from "react";
import { FaAward, FaCertificate, FaCrown } from "react-icons/fa";
import "./Philosophy.css";


const Philosophy = () => {
  return (
    <section className="philosophy-section" id="philosophy">
      <h2 className="philosophy-title">The LoopCart Philosophy</h2>
      <p className="philosophy-title">
        We believe in extending the lifecycle of premium electronics through meticulous
        curation and exceptional service.
      </p>

      <div className="philosophy-cards">
        <div className="philosophy-card">
          <div className="icon-circle purple-bg">
            <FaAward className="icon purple" />
          </div>
          <h4>Exquisite Curation</h4>
          <p>
            Each device hand-selected for exceptional quality and performance
          </p>
        </div>

        <div className="philosophy-card">
          <div className="icon-circle pink-bg">
            <FaCertificate className="icon pink" />
          </div>
          <h4>Certified Excellence</h4>
          <p>
            Rigorous testing and certification by our master technicians
          </p>
        </div>

        <div className="philosophy-card highlight">
          <div className="icon-circle blue-bg">
            <FaCrown className="icon blue" />
          </div>
          <h4>Concierge Service</h4>
          <p>
            White-glove experience from selection to aftercare
          </p>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
