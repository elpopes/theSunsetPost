import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Stores logged-in user data
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload; // Save user data (e.g., email, token, etc.)
    },
    logout(state) {
      state.user = null; // Clear user data on logout
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
