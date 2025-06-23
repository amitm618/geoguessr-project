// hooks/useGameLogic.js
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import fetchStreetView from "../utils/fetchStreetView";
import submitScore from "../utils/submitScore";

import calculateDistance from "../utils/calculateDistance";
import { MAX_SCORE_DISTANCE } from "../utils/constants";

const useGameLogic = (onUnauthorized) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [latLng, setLatLng] = useState(null);
  const [guess, setGuess] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [points, setPoints] = useState(null);
  const authed = useSelector((state) => state.auth.isAuthenticated);

  const handleSubmitGuess = useCallback(() => {
    if (guess && latLng) {
      const dist = calculateDistance(guess, latLng);
      const score = Math.max(
        0,
        Math.round(1000 * (1 - dist / MAX_SCORE_DISTANCE))
      );
      setPoints(score);
      setDistanceKm(dist.toFixed(2));
      setShowResult(true);

      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found — user must log in to submit score.");
        return;
      }

      submitScore({
        token,
        distance_km: dist,
        points: score,
        guess,
        actual: latLng,
        onUnauthorized,
      });
    }
  }, [guess, latLng, onUnauthorized]);

  const handlePlay = useCallback(() => {
    fetchStreetView({ setLatLng, setImageUrl });
    setGuess(null);
    setShowResult(false);
    setDistanceKm(null);
    setResetZoomSignal((prev) => prev + 1);
    setIsMapExpanded(false);
    setPoints(null);
  }, []);

  const handleMapClick = useCallback((latLng) => {
    setGuess(latLng);
    setIsMapExpanded(true);
  }, []);

  // Submit guess on enter or space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Enter" || e.key === " ") && guess) {
        handleSubmitGuess();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guess, handleSubmitGuess]);

  // Auto-play after login
  useEffect(() => {
    if (authed) handlePlay();
  }, [authed, handlePlay]);

  return {
    imageUrl,
    latLng,
    guess,
    showResult,
    distanceKm,
    resetZoomSignal,
    isMapExpanded,
    points,
    handlePlay,
    handleSubmitGuess,
    handleMapClick,
    setIsMapExpanded,
  };
};

export default useGameLogic;
