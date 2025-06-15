import React, { useEffect, useState } from "react";

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");

  useEffect(() => {
    fetch("/backend-address.txt")
      .then((res) => res.text())
      .then((text) => {
        const match = text.match(/^BACKEND_ADDRESS\s*=\s*(.+)$/m);
        if (match) {
          setApiBaseUrl(match[1].trim());
        } else {
          console.error(
            "Could not parse BACKEND_ADDRESS from backend-address.txt"
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load backend address:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiBaseUrl) return setError("Backend address not loaded yet.");

    const endpoint = mode === "login" ? "login" : "register";
    const url = `${apiBaseUrl}/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      console.log("✅ Auth Success:", data);
      onAuthSuccess(data.access_token);
    } catch (err) {
      console.error("❌ Auth error:", err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    if (!apiBaseUrl) return setError("Backend address not loaded yet.");
    window.location.href = `${apiBaseUrl}/auth/google/login`;
  };

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form">
        <h2>{mode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} autoComplete="on">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleGoogleLogin} className="google-login-button">
            🌐 Sign in with Google
          </button>
        </div>

        {error && <p className="error-text">❌ {error}</p>}

        <p style={{ marginTop: "1rem" }}>
          {mode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
          <button
            type="button"
            onClick={() =>
              setMode((prev) => (prev === "login" ? "register" : "login"))
            }
          >
            {mode === "login" ? "Register" : "Login"} instead
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
