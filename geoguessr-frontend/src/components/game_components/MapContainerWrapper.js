import React from "react";
import "../../App.css";

const MapContainerWrapper = ({ isExpanded, children }) => {
  const className = `overlay-map ${isExpanded ? "expanded" : "shrunk"}`;

  return <div className={className}>{children}</div>;
};

export default MapContainerWrapper;
