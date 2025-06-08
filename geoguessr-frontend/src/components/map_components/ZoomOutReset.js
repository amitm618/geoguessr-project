import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ZoomOutReset = ({ signal }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([40, 0], 2); // Default world view
  }, [signal, map]);

  return null;
};

export default ZoomOutReset;
