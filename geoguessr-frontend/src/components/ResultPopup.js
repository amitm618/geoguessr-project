// components/ResultPopup.js
import React from "react";

const ResultPopup = ({ distanceKm, points, onPlayAgain }) => (
  <div className="result-popup">
    <h2>🎯 Results</h2>
    <p>
      🧭 You were <strong>{distanceKm} km</strong> away
    </p>
    <p>
      🏆 You earned <strong>{points} points</strong>
    </p>
    <button onClick={onPlayAgain} className="play-again-button">
      Play Again
    </button>
  </div>
);

export default ResultPopup;
