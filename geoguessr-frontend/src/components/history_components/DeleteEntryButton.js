import React from "react";

const DeleteEntryButton = ({ entryId, onDelete }) => {
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/me/history/${entryId}/hide`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        onDelete(); // refresh the list
      } else {
        console.error("Failed to delete entry:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
};

export default DeleteEntryButton;
