import React, { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { Link } from "react-router-dom";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const typingTimeoutRef = useRef(null);
  const [searchFinished, setSearchFinished] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setSearchFinished(false);
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetchWithAuth(
          `/users/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setSearchFinished(true);
      }
    }, 300);
  }, [query]);

  const highlightMatch = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <strong>{text.slice(idx, idx + query.length)}</strong>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="profile-section">
      <h3>Search Users</h3>
      <input
        type="text"
        placeholder="Enter email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
      />
      <ul style={{ marginTop: "1rem" }}>
        {searchFinished && results.length === 0 ? (
          <li>No users found.</li>
        ) : (
          results.map((user) => (
            <li key={user.id}>
              <Link to={`/user/${encodeURIComponent(user.email)}`}>
                {highlightMatch(user.email, query)}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserSearch;
