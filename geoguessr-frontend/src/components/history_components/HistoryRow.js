import React from "react";
import DeleteEntryButton from "./DeleteEntryButton";

const HistoryRow = ({ entry, onDelete }) => {
  return (
    <tr>
      <td>
        {entry.guess_lat.toFixed(2)}, {entry.guess_lng.toFixed(2)} →{" "}
        {entry.actual_lat.toFixed(2)}, {entry.actual_lng.toFixed(2)}
      </td>
      <td>{entry.distance_km.toFixed(2)}</td>
      <td>{entry.points}</td>
      <td>
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).format(new Date(entry.created_at))}
      </td>
      <td>
        <DeleteEntryButton entryId={entry.id} onDelete={onDelete} />
      </td>
    </tr>
  );
};

export default HistoryRow;
