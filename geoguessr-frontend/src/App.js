import { useCallback } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";

import AuthForm from "./components/AuthForm";
import Header from "./components/Header";
import Home from "./components/Home";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";
import SessionExpiredModal from "./components/SessionExpiredModal";
import useAuthGate from "./services/useAuthGate";

function App() {
  const { authed, sessionExpired, handleLogout, setSessionExpired } =
    useAuthGate();

  const handleUnauthorized = useCallback(() => {
    setSessionExpired(true);
  }, [setSessionExpired]);

  if (!authed || sessionExpired) {
    return sessionExpired ? (
      <SessionExpiredModal onConfirm={handleLogout} />
    ) : (
      <AuthForm />
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              handleLogout={handleLogout}
              handleUnauthorized={handleUnauthorized}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Header handleLogout={handleLogout} />
              <Profile handleUnauthorized={handleUnauthorized} />
            </>
          }
        />
        <Route path="/user/:username" element={<PublicProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
