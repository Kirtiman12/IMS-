import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "@/mock/mockData";

export interface AuthUser {
  id: string; name: string; email: string; role: Role;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, isAuthenticated: false } as AuthState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
