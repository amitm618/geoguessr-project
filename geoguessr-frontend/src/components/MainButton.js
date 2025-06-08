// components/MainButton.js
import React from "react";

const MainButton = ({ onClick, disabled, children }) => (
  <button className="main-button" onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export default MainButton;
