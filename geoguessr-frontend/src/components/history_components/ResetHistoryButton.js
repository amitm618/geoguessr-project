import React from "react";

const ResetHistoryButton = ({ onReset }) => {
  const handleResetAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to reset your entire history?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/me/history/reset", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onReset(); // refresh the list
      } else {
        console.error("Failed to reset all history:", await res.text());
      }
    } catch (err) {
      console.error("Error resetting history:", err);
    }
  };

  return (
    <button className="reset-history-button" onClick={handleResetAll}>
      🔄 Reset History
    </button>
  );
};

export default ResetHistoryButton;
