import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { useCallback } from "react";

const useFetchHistory = (setHistory, handleUnauthorized) => {
  return useCallback(() => {
    fetchWithAuth("/me/history", {}, handleUnauthorized)
      .then((res) => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load history:", err));
  }, [setHistory, handleUnauthorized]);
};

export default useFetchHistory;
