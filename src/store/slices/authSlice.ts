import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserAccount } from "@/types/auth";

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: UserAccount;
        tokens: { accessToken: string; refreshToken: string };
      }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.tokens = action.payload.tokens;
    },
    clearUser: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.tokens = {
        accessToken: null,
        refreshToken: null,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserAccount>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },
    logout: state => {
      state.user = null;
      state.tokens = {
        accessToken: null,
        refreshToken: null,
      };
      state.isAuthenticated = false;

      // Clear all auth-related data from localStorage and sessionStorage
      localStorage.removeItem("userDetail");
      sessionStorage.removeItem("registrationFormData");
      sessionStorage.removeItem("registrationFormActive");
    },
  },
});

export const { setUser, clearUser, setLoading, updateUserProfile, setTokens, logout } =
  authSlice.actions;
export default authSlice.reducer;
