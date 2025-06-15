import React from "react";
import { Link } from "react-router-dom";
import MainButton from "./MainButton";
import "../App.css";

const Header = ({ showResult, guess, handleSubmit, onLogout }) => {
  const token = localStorage.getItem("token");
  const userEmail = token
    ? JSON.parse(atob(token.split(".")[1])).sub
    : "Unknown";

  return (
    <header className="header compact">
      <h1 className="header-title">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          GeoGuessr Lite 🌍
        </Link>
      </h1>

      {!showResult && handleSubmit && (
        <MainButton onClick={handleSubmit} disabled={!guess}>
          Submit Guess
        </MainButton>
      )}

      <nav className="menu">
        <Link to="/profile" className="menu-item">
          <strong>{userEmail}</strong>
        </Link>

        <button className="menu-item" onClick={onLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
