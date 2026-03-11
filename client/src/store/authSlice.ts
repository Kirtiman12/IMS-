import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/mock/mockData"; // keep mock import

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  Role;
}

interface AuthState {
  user:            AuthUser | null;
  token:           string | null;
  isAuthenticated: boolean;
  isRegistering:   boolean;
  registerError:   string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("authUser") ?? "null"),
  token:           localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isRegistering:   false,
  registerError:   null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: AuthUser; token: string | null }>) {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.registerError = null;
        localStorage.setItem("authUser", JSON.stringify(action.payload.user));
      if (action.payload.token) {
        localStorage.setItem("accessToken", action.payload.token);
      }
    },

    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
    },

    registerStart(state) {
      state.isRegistering = true;
      state.registerError = null;
    },

    registerSuccess(state, action: PayloadAction<{ user: AuthUser; token: string | null }>) {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.isRegistering   = false;
      state.registerError   = null;
      if (action.payload.token) {
        localStorage.setItem("accessToken", action.payload.token);
        localStorage.setItem("authUser", JSON.stringify(action.payload.user));
      }
    },

    registerFailure(state, action: PayloadAction<string>) {
      state.isRegistering = false;
      state.registerError = action.payload;
    },

    clearRegisterError(state) {
      state.registerError = null;
    },
  },
});

export const {
  loginSuccess,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  clearRegisterError,
} = authSlice.actions;

export default authSlice.reducer;
