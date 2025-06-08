// src/components/PublicProfile.js
import React, { useEffect, useState } from "react";
import Header from "./Header";
import GameHistory from "./GameHistory";
import Stats from "./Stats";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const PublicProfile = () => {
  const { username } = useParams();
  const [email, setEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth(`/user/${username}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setEmail(data.email);
        setUserId(data.id);
      } catch (err) {
        console.error(err);
        setEmail("Not Found");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  return (
    <>
      <Header />

      <div style={{ padding: "1rem" }}>
        <h2>👤 Public Profile</h2>
        {loading ? (
          <p>Loading...</p>
        ) : email === "Not Found" ? (
          <p>User not found</p>
        ) : (
          <div
            style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}
          >
            <div style={{ flex: 1 }}>
              <section
                className="profile-section"
                style={{ marginBottom: "2rem" }}
              >
                <h3>User Info</h3>
                <p>
                  Email: <strong>{email}</strong>
                </p>
              </section>
              <section className="profile-section">
                <Stats userId={userId} />
              </section>
            </div>

            <div className="profile-section" style={{ flex: 1 }}>
              <GameHistory userId={userId} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicProfile;
