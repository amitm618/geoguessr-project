import React from "react";
import { Marker, useMapEvents } from "react-leaflet";

const LocationPicker = ({ guessPosition, setGuessPosition, showResult }) => {
  useMapEvents({
    click(e) {
      if (!showResult) {
        setGuessPosition(e.latlng);
      }
    },
  });

  return guessPosition ? <Marker position={guessPosition} /> : null;
};

export default LocationPicker;
