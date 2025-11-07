import React from 'react'

const Header = () => (
  <nav className="navbar navbar-expand-lg bg-light shadow-sm fixed-top">
    <div className="container">
      <a className="navbar-brand fw-bold" href="#">LoopCart</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item"><a className="nav-link" href="#boutiques">Boutiques</a></li>
          <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
        </ul>
      </div>
    </div>
  </nav>
)

export default Header
