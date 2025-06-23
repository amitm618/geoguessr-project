import React from "react";

const ImageViewer = ({ imageUrl, latLng }) => {
  if (!imageUrl || !latLng) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <img
        src={imageUrl}
        alt="Street View"
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "auto",
          borderRadius: "8px",
        }}
      />
      <p>
        Lat: {latLng.lat.toFixed(4)}, Lng: {latLng.lng.toFixed(4)}
      </p>
    </div>
  );
};

export default ImageViewer;
