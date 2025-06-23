import { useEffect } from "react";
import { useDispatch } from "react-redux";

import useGameLogic from "../services/useGameLogic";
import { logout } from "../redux/authSlice";
import { isTokenExpired } from "../utils/jwtUtils";
import Header from "./Header";
import GuessMap from "./game_components/GuessMap";
import MapContainerWrapper from "./game_components/MapContainerWrapper";
import ResultPopup from "./game_components/ResultPopup";
import StreetViewImage from "./game_components/StreetViewImage";

const Home = ({ handleLogout, handleUnauthorized }) => {
  const dispatch = useDispatch();

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
    handleSubmitGuess,
    handleMapClick,
    setIsMapExpanded,
  } = useGameLogic(handleUnauthorized);

  // Auto logout on token expiration
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
        handleSubmitGuess={handleSubmitGuess}
        handleLogout={handleLogout}
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
};

export default Home;
