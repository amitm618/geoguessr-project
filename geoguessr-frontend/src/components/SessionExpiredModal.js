import React from "react";

const SessionExpiredModal = ({ onConfirm }) => {
  return (
    <div className="session-expired-modal">
      <div className="modal-content">
        <h2>🔒 Session Expired</h2>
        <p>Your session has expired. Please log in again to continue.</p>
        <button onClick={onConfirm}>Log In Again</button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
