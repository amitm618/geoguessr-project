import React, { useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const SetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmitSetPass = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetchWithAuth("/me/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to set password.");
      }

      setMessage("Password set successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(`${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmitSetPass} style={{ marginTop: "1rem" }}>
      <h4>Set a Password</h4>
      <div>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" style={{ marginTop: "0.5rem" }}>
        Set Password
      </button>
      {message && <p style={{ marginTop: "0.5rem" }}>{message}</p>}
    </form>
  );
};

export default SetPasswordForm;
