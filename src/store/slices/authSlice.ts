import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { UserAccount } from "@/types/auth";
import { refreshAccessToken, signout as signoutApi } from "@/services/api/authApi";

const STORAGE_KEY = "userDetail";

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("registrationFormData");
  sessionStorage.removeItem("registrationFormActive");
};

const getStoredTokens = (): { accessToken: string; refreshToken: string } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const accessToken = parsed?.auth?.tokens?.accessToken;
    const refreshToken = parsed?.auth?.tokens?.refreshToken;
    if (accessToken && refreshToken) return { accessToken, refreshToken };
    return null;
  } catch {
    return null;
  }
};

const getStoredUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.auth?.user || null;
  } catch {
    return null;
  }
};

const persistAuth = (
  user: UserAccount | null,
  tokens: { accessToken: string; refreshToken: string } | null
) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? JSON.parse(raw) : {};
    const next = {
      ...base,
      auth: {
        ...(base.auth || {}),
        user: user ?? base.auth?.user ?? null,
        isAuthenticated: !!tokens,
        tokens: tokens ?? base.auth?.tokens ?? { accessToken: null, refreshToken: null },
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("persistAuth", e);
  }
};

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authInitAttempted: boolean;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export const initializeAuth = createAsyncThunk<
  { user: UserAccount; tokens: { accessToken: string; refreshToken: string } } | null,
  void,
  { rejectValue: string }
>("auth/initializeAuth", async (_, { rejectWithValue }) => {
  const storedTokens = getStoredTokens();
  const storedUser = getStoredUser();

  if (!storedTokens || !storedUser) {
    return null;
  }

  // NEW: Check if access token is expired before attempting refresh
  // This prevents unnecessary refresh calls when token is still valid
  try {
    // Decode JWT to check expiry (simple check - in production, use a library like jwt-decode)
    const tokenPayload = JSON.parse(atob(storedTokens.accessToken.split(".")[1]));
    const expiryTime = tokenPayload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5-minute buffer

    // If token is still valid (not expired within buffer), use stored tokens
    if (expiryTime > currentTime + bufferTime) {
      console.debug("[initializeAuth] Access token still valid, using stored credentials");
      return { user: storedUser, tokens: storedTokens };
    }

    // Token is about to expire or already expired - attempt refresh
    console.debug("[initializeAuth] Access token expired, attempting refresh");
    const newTokens = await refreshAccessToken(storedTokens.refreshToken);

    // Update localStorage with new tokens
    persistAuth(storedUser, newTokens);

    return { user: storedUser, tokens: newTokens };
  } catch (e) {
    // If JWT decode fails or refresh fails, check if it's an auth failure or network issue
    const isAuthFailure =
      e instanceof Error &&
      (e.message?.includes("Session invalid") || /unauthorized|invalid|expired/i.test(e.message));

    if (isAuthFailure) {
      clearAuthStorage();
      return rejectWithValue(e instanceof Error ? e.message : "Auth initialization failed");
    }

    // Network/server error: keep session, return stored user/tokens
    console.warn("[initializeAuth] Token refresh failed, using stored credentials:", e);
    return { user: storedUser, tokens: storedTokens };
  }
});

export const syncUserState = createAsyncThunk<UserAccount, void, { rejectValue: string }>(
  "auth/syncUserState",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const storedUser = getStoredUser();

    // Use Redux user if available, otherwise use stored user
    const user = state.auth.user || storedUser;

    if (!user) {
      return rejectWithValue("No user data available");
    }

    return user;
  }
);

export const logoutThunk = createAsyncThunk<
  void,
  void | { redirectTo?: string },
  { rejectValue: string }
>("auth/logoutThunk", async (_opts, { getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.tokens?.accessToken;
    if (token) {
      await signoutApi(token);
    }
  } catch (e) {
    console.error("Logout API error:", e);
  }
  clearAuthStorage();
});

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authInitAttempted: false,
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
      const { user, tokens } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.tokens = tokens;
      persistAuth(user, tokens);
    },
    updateUser: (state, action: PayloadAction<Partial<UserAccount>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        const tokens =
          state.tokens.accessToken && state.tokens.refreshToken
            ? { accessToken: state.tokens.accessToken, refreshToken: state.tokens.refreshToken }
            : null;
        persistAuth(state.user, tokens);
      }
    },
    clearUser: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.tokens = { accessToken: null, refreshToken: null };
      clearAuthStorage();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      if (state.user) {
        persistAuth(state.user, action.payload);
      } else {
        persistAuth(null, action.payload);
      }
    },
    logout: state => {
      state.user = null;
      state.tokens = { accessToken: null, refreshToken: null };
      state.isAuthenticated = false;
      clearAuthStorage();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authInitAttempted = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
          persistAuth(action.payload.user, action.payload.tokens);
        } else {
          state.user = null;
          state.tokens = { accessToken: null, refreshToken: null };
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, state => {
        state.isLoading = false;
        state.authInitAttempted = true;
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.isAuthenticated = false;
        clearAuthStorage();
      })
      .addCase(syncUserState.fulfilled, (state, action) => {
        state.user = action.payload;
        if (state.user && state.tokens.accessToken && state.tokens.refreshToken) {
          persistAuth(state.user, {
            accessToken: state.tokens.accessToken,
            refreshToken: state.tokens.refreshToken,
          });
        }
      })
      .addCase(syncUserState.rejected, state => {
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.isAuthenticated = false;
        clearAuthStorage();
      })
      .addCase(logoutThunk.fulfilled, state => {
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.isAuthenticated = false;
        clearAuthStorage();
      })
      .addCase(logoutThunk.rejected, state => {
        state.user = null;
        state.tokens = { accessToken: null, refreshToken: null };
        state.isAuthenticated = false;
        clearAuthStorage();
      });
  },
});

export const { setUser, updateUser, clearUser, setLoading, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
