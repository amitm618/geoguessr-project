import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import GuessMap from "./components/GuessMap";
import MapContainerWrapper from "./components/map_components/MapContainerWrapper";
import ResultPopup from "./components/ResultPopup";
import Header from "./components/Header";
import StreetViewImage from "./components/StreetViewImage";
import useGameLogic from "./hooks/useGameLogic";
import PublicProfile from "./components/PublicProfile"; // ⬅️ Add this at the top

import AuthForm from "./components/AuthForm";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { isTokenExpired } from "./utils/jwtUtils";
import Profile from "./components/Profile"; // ⬅️ import the new component

import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "./store/slices/authSlice";

function GamePage() {
  const dispatch = useDispatch();
  const authed = useSelector((state) => state.auth.isAuthenticated);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const {
    imageUrl,
    latLng,
    guess,
    showResult,
    distanceKm,
    resetZoomSignal,
    isMapExpanded,
    points,
    handlePlay,
    handleSubmit,
    handleMapClick,
    setIsMapExpanded,
  } = useGameLogic(setHistoryRefreshKey);

  // Auto-play after login
  useEffect(() => {
    if (authed) handlePlay();
  }, [authed, handlePlay]);

  //Press enter to guess
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Enter" || e.key === " ") && guess) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [guess, handleSubmit]);

  // Auto-logout if token is expired
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        dispatch(logout());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="App">
      <Header
        showResult={showResult}
        guess={guess}
        handleSubmit={handleSubmit}
        onLogout={() => dispatch(logout())}
      />
      <div className="main-content">
        <div className="image-wrapper">
          <StreetViewImage
            imageUrl={imageUrl}
            onClick={() => setIsMapExpanded(false)}
          />
          <MapContainerWrapper isExpanded={isMapExpanded}>
            <GuessMap
              guessPosition={guess}
              setGuessPosition={handleMapClick}
              actualLocation={latLng}
              showResult={showResult}
              resetZoomSignal={resetZoomSignal}
              isMapExpanded={isMapExpanded}
            />
          </MapContainerWrapper>
        </div>
      </div>
      {showResult && distanceKm && points !== null && (
        <ResultPopup
          distanceKm={distanceKm}
          points={points}
          onPlayAgain={handlePlay}
        />
      )}
    </div>
  );
}

function App() {
  const authed = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Parse token from URL after Google login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      dispatch(login(token));
      window.history.replaceState({}, document.title, "/");
    }
  }, [dispatch]);

  console.log(
    "🔐 Auth state:",
    useSelector((state) => state.auth)
  ); // 👈 Debug log

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    setSessionExpired(false);
  };

  if (!authed || sessionExpired) {
    return sessionExpired ? (
      <SessionExpiredModal onConfirm={handleLogout} />
    ) : (
      <AuthForm onAuthSuccess={(token) => dispatch(login(token))} />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route
          path="/profile"
          element={
            <>
              <Header onLogout={handleLogout} />
              <Profile onUnauthorized={() => setSessionExpired(true)} />
            </>
          }
        />
        <Route path="/user/:username" element={<PublicProfile />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
