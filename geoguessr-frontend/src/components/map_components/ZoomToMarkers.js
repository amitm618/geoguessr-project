import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ZoomToMarkers = ({ guess, actual }) => {
  const map = useMap();

  useEffect(() => {
    if (guess && actual) {
      const bounds = [
        [guess.lat, guess.lng],
        [actual.lat, actual.lng],
      ];
      map.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1.5, // in seconds
      });
    }
  }, [guess, actual, map]);

  return null;
};

export default ZoomToMarkers;
