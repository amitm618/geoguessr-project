import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/authSlice";

export default function useAuthGate() {
  const authed = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check for token in URL (only when logging in with google)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      dispatch(login(token));
      window.history.replaceState({}, document.title, "/"); // clear URL so it looks cleaner
    }
  }, [dispatch]);

  const handleLogout = () => {
    //localStorage.removeItem("token"); (already handled in logout action)
    dispatch(logout());
    setSessionExpired(false);
  };

  return {
    authed, // is the user logged in?
    sessionExpired, // has the session expired?
    setSessionExpired,
    handleLogout, // function to flag session expired
    dispatch, // redux dispatch function
  };
}
