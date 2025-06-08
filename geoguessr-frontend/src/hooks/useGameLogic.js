// hooks/useGameLogic.js
import { useState, useCallback } from "react";
import fetchStreetView from "../utils/fetchStreetView";
import calculateDistance from "../utils/calculateDistance";
import { MAX_SCORE_DISTANCE } from "../utils/constants";

const useGameLogic = (setHistoryRefreshKey) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [latLng, setLatLng] = useState(null);
  const [guess, setGuess] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [points, setPoints] = useState(null);

  const handleSubmit = useCallback(() => {
    if (guess && latLng) {
      const dist = calculateDistance(guess, latLng);
      const score = Math.max(
        0,
        Math.round(1000 * (1 - dist / MAX_SCORE_DISTANCE))
      );
      setPoints(score);
      setDistanceKm(dist.toFixed(2));
      setShowResult(true);

      // ✅ Trigger history refresh
      setHistoryRefreshKey?.((prev) => prev + 1);

      // ✅ Backend call
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found — user must log in to submit score.");
        return;
      }

      fetch("http://127.0.0.1:8000/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          distance_km: dist,
          points: score,
          guess_lat: guess.lat,
          guess_lng: guess.lng,
          actual_lat: latLng.lat,
          actual_lng: latLng.lng,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Score submitted:", data);
        })
        .catch((err) => {
          console.error("Error submitting score:", err);
        });
    }
  }, [guess, latLng, setHistoryRefreshKey]);

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
    handleSubmit,
    handleMapClick,
    setIsMapExpanded,
  };
};

export default useGameLogic;
