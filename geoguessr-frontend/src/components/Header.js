import React from "react";
import { Link } from "react-router-dom";
import MainButton from "./game_components/MainButton";
import "../App.css";

const Header = ({ showResult, guess, handleSubmitGuess, handleLogout }) => {
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

      {!showResult && handleSubmitGuess && (
        <MainButton onClick={handleSubmitGuess} disabled={!guess}>
          Submit Guess
        </MainButton>
      )}

      <nav className="menu">
        <Link to="/profile" className="menu-item">
          <strong>{userEmail}</strong>
        </Link>

        <button className="menu-item" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
