import React, { useState, useEffect } from "react";
import GameHistory from "./profile_components/GameHistory";
import Stats from "./profile_components/Stats";
import ChangePasswordForm from "./profile_components/ChangePasswordForm";
import SetPasswordForm from "./profile_components/SetPasswordForm";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import UserSearch from "./profile_components/UserSearch";

const Profile = ({ handleUnauthorized }) => {
  const token = localStorage.getItem("token");
  const email = token ? JSON.parse(atob(token.split(".")[1])).sub : "Unknown";
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [isLoadingPasswordStatus, setIsLoadingPasswordStatus] = useState(true);

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const res = await fetchWithAuth("/me");
        if (res.status === 401 && handleUnauthorized) {
          handleUnauthorized();
          return;
        }
        const data = await res.json();
        setHasPassword(data.has_password);
      } catch (err) {
        console.error("Failed to check password status:", err);
      } finally {
        setIsLoadingPasswordStatus(false);
      }
    };

    checkPasswordStatus();
  }, [handleUnauthorized]);

  return (
    <div className="profile-page-container">
      <h2 className="profile-header">👤 Profile</h2>

      <div className="profile-container">
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

        <div className="profile-section" style={{ flex: 1 }}>
          <GameHistory
            refreshTrigger={0}
            handleUnauthorized={handleUnauthorized}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
