import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/mock/mockData";

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  Role;
}

interface AuthState {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isRegistering:   boolean;
  registerError:   string | null;
}

const initialState: AuthState = {
  user:            null,
  isAuthenticated: false,
  isRegistering:   false,
  registerError:   null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.registerError   = null;
    },

    logout(state) {
      state.user            = null;
      state.isAuthenticated = false;
    },

    registerStart(state) {
      state.isRegistering = true;
      state.registerError = null;
    },

    registerSuccess(state, action: PayloadAction<AuthUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.isRegistering   = false;
      state.registerError   = null;
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
