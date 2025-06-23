import React from "react";

const StreetViewImage = ({ imageUrl, onClick }) => {
  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt="Street View"
      className="street-image"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    />
  );
};

export default StreetViewImage;
