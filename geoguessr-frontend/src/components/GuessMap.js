import React from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import ZoomToMarkers from "./map_components/ZoomToMarkers";
import ZoomOutReset from "./map_components/ZoomOutReset";
import ForceResizeOnExpand from "./map_components/ForceResizeOnExpand";
import LocationPicker from "./map_components/LocationPicker";
import { createLineBetweenPoints } from "./map_components/lineHelpers";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Red icon for the actual location
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GuessMap = ({
  guessPosition,
  setGuessPosition,
  actualLocation,
  showResult,
  resetZoomSignal,
  isMapExpanded,
}) => {
  const line = createLineBetweenPoints(guessPosition, actualLocation);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <MapContainer
        center={[40, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomOutReset signal={resetZoomSignal} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ForceResizeOnExpand trigger={isMapExpanded} />

        <LocationPicker
          guessPosition={guessPosition}
          setGuessPosition={setGuessPosition}
          showResult={showResult}
        />

        {showResult && actualLocation && (
          <Marker
            position={[actualLocation.lat, actualLocation.lng]}
            icon={redIcon}
          />
        )}

        {showResult && guessPosition && actualLocation && (
          <ZoomToMarkers guess={guessPosition} actual={actualLocation} />
        )}

        {showResult && line && (
          <Polyline positions={line} color="orange" weight={3} dashArray="8" />
        )}
      </MapContainer>
    </div>
  );
};

export default GuessMap;
