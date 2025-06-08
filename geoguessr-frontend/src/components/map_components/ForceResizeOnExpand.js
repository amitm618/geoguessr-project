import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ForceResizeOnExpand = ({ trigger }) => {
  const map = useMap();

  useEffect(() => {
    if (trigger) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300); // give it time to render
    }
  }, [trigger, map]);

  return null;
};

export default ForceResizeOnExpand;
