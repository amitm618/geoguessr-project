import { createSlice } from "@reduxjs/toolkit";
import { isTokenExpired } from "../../utils/jwtUtils";

const token = localStorage.getItem("token"); // ✅ Define token before using it

const initialState = {
  isAuthenticated: token && !isTokenExpired(token),
  token: token || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload);
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
