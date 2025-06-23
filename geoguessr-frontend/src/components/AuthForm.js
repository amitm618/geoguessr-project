import { useEffect, useState } from "react";
import { loadBackendAddress } from "../utils/loadBackendAddress"; // adjust path if needed
import { useDispatch } from "react-redux";

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // login or register
  const [email, setEmail] = useState(""); //input
  const [password, setPassword] = useState(""); //input
  const [error, setError] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    loadBackendAddress()
      .then(setApiBaseUrl)
      .catch((err) => {
        console.error("Failed to load backend address:", err);
        setError("Could not load backend address.");
      });
  }, []);

  const handleSubmitLogin = async (e) => {
    e.preventDefault(); //prevents page from refreshing when i click login/register
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
        //checks if status code is ok (ok is 200-299)
        throw new Error(data.detail || "Authentication failed");
      }

      console.log("Auth Success:", data);
      dispatch({ type: "auth/login", payload: data.access_token });
    } catch (err) {
      console.error("Auth error:", err); //errors from try block above
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
        <form onSubmit={handleSubmitLogin} autoComplete="on">
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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={handleGoogleLogin}
            className="google-login-button"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              style={{ width: "20px", height: "20px" }}
            />
            Sign in with Google
          </button>
        </div>

        {error && <p className="error-text"> {error}</p>}

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
