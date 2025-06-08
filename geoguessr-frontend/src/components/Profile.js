import React, { useState, useEffect } from "react";
import GameHistory from "./GameHistory";
import Stats from "./Stats";
import ChangePasswordForm from "./ChangePasswordForm";
import SetPasswordForm from "./SetPasswordForm";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import UserSearch from "./UserSearch";

const Profile = ({ onUnauthorized }) => {
  const token = localStorage.getItem("token");
  const email = token ? JSON.parse(atob(token.split(".")[1])).sub : "Unknown";
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [hasPassword, setHasPassword] = useState(true); // default to true
  const [isLoadingPasswordStatus, setIsLoadingPasswordStatus] = useState(true);

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const res = await fetchWithAuth("/me");
        const data = await res.json();
        setHasPassword(data.has_password);
      } catch (err) {
        console.error("Failed to check password status:", err);
      } finally {
        setIsLoadingPasswordStatus(false);
      }
    };

    checkPasswordStatus();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>👤 Profile</h2>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* Left column: user info + stats */}
        <div style={{ flex: 1 }}>
          <section className="profile-section" style={{ marginBottom: "2rem" }}>
            <h3>User Info</h3>
            <p>
              Email: <strong>{email}</strong>
            </p>
            <p>Password: ********</p>

            {!isLoadingPasswordStatus && (
              <>
                {hasPassword ? (
                  <>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="update-password-btn"
                    >
                      {showPasswordForm ? "Cancel" : "Update Password"}
                    </button>
                    {showPasswordForm && <ChangePasswordForm />}
                  </>
                ) : (
                  <SetPasswordForm />
                )}
              </>
            )}
          </section>

          <section className="profile-section">
            <Stats />
            <section>
              <UserSearch />
            </section>
          </section>
        </div>

        {/* Right column: history */}
        <div className="profile-section" style={{ flex: 1 }}>
          <GameHistory refreshTrigger={0} onUnauthorized={onUnauthorized} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
