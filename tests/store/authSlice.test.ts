/**
 * Auth Redux Slice Tests
 *
 * Unit tests for authSlice: reducers, actions, and async thunks.
 * Tests state transitions for init, setUser, logout, and token refresh.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import authReducer, {
  initializeAuth,
  logoutThunk,
  setUser,
  updateUser,
  clearUser,
  setLoading,
  logout,
} from "@/store/slices/authSlice";
import type { AuthState } from "@/store/slices/authSlice";
import type { UserAccount } from "@/types/auth";
import { signout as signoutApi } from "@/services/api/authApi";

vi.mock("@/services/api/authApi", () => ({
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));

const mockUser: UserAccount = {
  id: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  businessName: "Acme Inc",
  phoneNumber: "+15551234567",
  industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
  zipCode: 94102,
  emailVerify: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockTokens = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.x",
  refreshToken: "refresh-token-1",
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authInitAttempted: false,
  tokens: { accessToken: null, refreshToken: null },
};

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("authSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    vi.stubGlobal("localStorage", mockLocalStorage);
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  describe("reducers", () => {
    it("should return initial state", () => {
      expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle setUser", () => {
      const newState = authReducer(initialState, setUser({ user: mockUser, tokens: mockTokens }));
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.tokens).toEqual(mockTokens);
      expect(newState.isLoading).toBe(false);
    });

    it("should handle updateUser", () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        tokens: mockTokens,
      };
      const newState = authReducer(stateWithUser, updateUser({ firstName: "John" }));
      expect(newState.user?.firstName).toBe("John");
      expect(newState.user?.lastName).toBe(mockUser.lastName);
    });

    it("should handle clearUser", () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        tokens: mockTokens,
      };
      const newState = authReducer(stateWithUser, clearUser());
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.tokens.accessToken).toBeNull();
      expect(newState.tokens.refreshToken).toBeNull();
    });

    it("should handle setLoading", () => {
      const newState = authReducer(initialState, setLoading(true));
      expect(newState.isLoading).toBe(true);
      const nextState = authReducer(newState, setLoading(false));
      expect(nextState.isLoading).toBe(false);
    });

    it("should handle logout", () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        tokens: mockTokens,
      };
      const newState = authReducer(stateWithUser, logout());
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.tokens.accessToken).toBeNull();
    });
  });

  describe("initializeAuth async thunk", () => {
    it("should set loading true on pending", () => {
      const newState = authReducer(initialState, {
        type: initializeAuth.pending.type,
      });
      expect(newState.isLoading).toBe(true);
    });

    it("should set user and tokens on fulfilled when payload present", () => {
      const loadingState: AuthState = { ...initialState, isLoading: true };
      const newState = authReducer(loadingState, {
        type: initializeAuth.fulfilled.type,
        payload: { user: mockUser, tokens: mockTokens },
      });
      expect(newState.isLoading).toBe(false);
      expect(newState.authInitAttempted).toBe(true);
      expect(newState.user).toEqual(mockUser);
      expect(newState.tokens).toEqual(mockTokens);
      expect(newState.isAuthenticated).toBe(true);
    });

    it("should clear auth on fulfilled when payload null", () => {
      const loadingState: AuthState = { ...initialState, isLoading: true };
      const newState = authReducer(loadingState, {
        type: initializeAuth.fulfilled.type,
        payload: null,
      });
      expect(newState.isLoading).toBe(false);
      expect(newState.authInitAttempted).toBe(true);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it("should clear auth on rejected", () => {
      const loadingState: AuthState = { ...initialState, isLoading: true };
      const newState = authReducer(loadingState, {
        type: initializeAuth.rejected.type,
        error: { message: "Session invalid" },
      });
      expect(newState.isLoading).toBe(false);
      expect(newState.authInitAttempted).toBe(true);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });

  describe("logoutThunk async thunk", () => {
    it("should clear state on fulfilled", () => {
      vi.mocked(signoutApi).mockResolvedValueOnce(undefined);
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        tokens: mockTokens,
      };
      const newState = authReducer(stateWithUser, {
        type: logoutThunk.fulfilled.type,
      });
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.tokens.accessToken).toBeNull();
    });

    it("should clear state on rejected", () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        tokens: mockTokens,
      };
      const newState = authReducer(stateWithUser, {
        type: logoutThunk.rejected.type,
      });
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });
});
