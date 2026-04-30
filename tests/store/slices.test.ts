/**
 * Comprehensive tests for all Redux store slices
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

// -------------------------------------------------------------------
// Mocks
// -------------------------------------------------------------------
vi.mock("@/services/api/authApi", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));

vi.mock("@/services/api/profileApi", () => ({
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteAccount: vi.fn(),
  resendEmailVerification: vi.fn(),
  retakeAssessment: vi.fn(),
}));

vi.mock("@/services/api/userApi", () => ({
  getUserById: vi.fn(),
}));

vi.mock("@/services/api/dashboardApi", () => ({
  getDashboard: vi.fn(),
}));

vi.mock("@/services/api/industryApi", () => ({
  getIndustry: vi.fn(),
}));

vi.mock("@/services/api/workforceApi", () => ({
  getWorkforce: vi.fn(),
}));

vi.mock("@/services/api/recommendationsApi", () => ({
  getRecommendations: vi.fn(),
}));

vi.mock("@/services/api/finchApi", () => ({
  getFinchStatus: vi.fn(),
}));

// -------------------------------------------------------------------
// authSlice
// -------------------------------------------------------------------
import authReducer, {
  setUser,
  updateUser,
  clearUser,
  setLoading,
  setTokens,
  logout,
  initializeAuth,
  syncUserState,
  logoutThunk,
} from "@/store/slices/authSlice";
import { refreshAccessToken, signout } from "@/services/api/authApi";

const mockUser = {
  id: "user-1",
  businessEmail: "user@test.com",
  firstName: "John",
  lastName: "Doe",
  emailVerify: true,
} as any;

const mockTokens = { accessToken: "at", refreshToken: "rt" };

describe("authSlice - reducers", () => {
  let state: ReturnType<typeof authReducer>;

  beforeEach(() => {
    state = authReducer(undefined, { type: "@@INIT" });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("initialState has correct defaults", () => {
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("setUser sets user, tokens and isAuthenticated", () => {
    const next = authReducer(state, setUser({ user: mockUser, tokens: mockTokens }));
    expect(next.user).toEqual(mockUser);
    expect(next.isAuthenticated).toBe(true);
    expect(next.tokens).toEqual(mockTokens);
    expect(next.isLoading).toBe(false);
  });

  it("updateUser merges partial user data", () => {
    let s = authReducer(state, setUser({ user: mockUser, tokens: mockTokens }));
    s = authReducer(s, updateUser({ firstName: "Jane" }));
    expect(s.user?.firstName).toBe("Jane");
    expect(s.user?.lastName).toBe("Doe");
  });

  it("updateUser does nothing when user is null", () => {
    const next = authReducer(state, updateUser({ firstName: "Jane" }));
    expect(next.user).toBeNull();
  });

  it("clearUser resets to default", () => {
    let s = authReducer(state, setUser({ user: mockUser, tokens: mockTokens }));
    s = authReducer(s, clearUser());
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
    expect(s.tokens.accessToken).toBeNull();
  });

  it("setLoading updates isLoading", () => {
    const next = authReducer(state, setLoading(true));
    expect(next.isLoading).toBe(true);
  });

  it("setTokens updates tokens with user present (both paths)", () => {
    const withUser = authReducer(state, setUser({ user: mockUser, tokens: mockTokens }));
    const s = authReducer(withUser, setTokens({ accessToken: "new-at", refreshToken: "new-rt" }));
    expect(s.tokens.accessToken).toBe("new-at");
    expect(s.isAuthenticated).toBe(true);
  });

  it("setTokens without user persists null user", () => {
    const s = authReducer(state, setTokens({ accessToken: "at2", refreshToken: "rt2" }));
    expect(s.isAuthenticated).toBe(true);
    expect(s.user).toBeNull();
  });

  it("logout resets state", () => {
    let s = authReducer(state, setUser({ user: mockUser, tokens: mockTokens }));
    s = authReducer(s, logout());
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });
});

describe("authSlice - initializeAuth thunk", () => {
  const createTestStore = () =>
    configureStore({ reducer: { auth: authReducer } });

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("resolves null when no stored tokens", async () => {
    const store = createTestStore();
    await store.dispatch(initializeAuth());
    expect(store.getState().auth.authInitAttempted).toBe(true);
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it("resolves null when stored tokens have no user", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({ auth: { tokens: { accessToken: "at", refreshToken: "rt" } } })
    );
    const store = createTestStore();
    await store.dispatch(initializeAuth());
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it("uses stored user when access token is still valid", async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const accessToken = `${header}.${payload}.sig`;
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({
        auth: {
          tokens: { accessToken, refreshToken: "rt" },
          user: mockUser,
        },
      })
    );
    const store = createTestStore();
    await store.dispatch(initializeAuth());
    expect(store.getState().auth.user?.id).toBe("user-1");
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it("refreshes tokens when access token expired", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ exp: pastExp }));
    const accessToken = `${header}.${payload}.sig`;
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({
        auth: {
          tokens: { accessToken, refreshToken: "rt" },
          user: mockUser,
        },
      })
    );
    vi.mocked(refreshAccessToken).mockResolvedValueOnce({ accessToken: "new-at", refreshToken: "new-rt" });
    const store = createTestStore();
    await store.dispatch(initializeAuth());
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it("returns stored session on refresh failure (network error)", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ exp: pastExp }));
    const accessToken = `${header}.${payload}.sig`;
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({
        auth: {
          tokens: { accessToken, refreshToken: "rt" },
          user: mockUser,
        },
      })
    );
    vi.mocked(refreshAccessToken).mockRejectedValueOnce(new Error("Network error"));
    const store = createTestStore();
    await store.dispatch(initializeAuth());
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it("rejects on auth failure during refresh", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(JSON.stringify({ exp: pastExp }));
    const accessToken = `${header}.${payload}.sig`;
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({
        auth: {
          tokens: { accessToken, refreshToken: "rt" },
          user: mockUser,
        },
      })
    );
    vi.mocked(refreshAccessToken).mockRejectedValueOnce(new Error("Session invalid"));
    const store = createTestStore();
    await store.dispatch(initializeAuth());
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBeNull();
  });
});

describe("authSlice - syncUserState thunk", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", { setItem: vi.fn(), removeItem: vi.fn() });
  });

  it("fulfills with Redux user when available", async () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(setUser({ user: mockUser, tokens: mockTokens }));
    await store.dispatch(syncUserState());
    expect(store.getState().auth.user?.firstName).toBe("John");
  });

  it("rejects when no user data", async () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    await store.dispatch(syncUserState());
    expect(store.getState().auth.user).toBeNull();
  });
});

describe("authSlice - logoutThunk", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", { removeItem: vi.fn() });
  });

  it("calls signout when token present and clears state", async () => {
    vi.mocked(signout).mockResolvedValueOnce(undefined);
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(setUser({ user: mockUser, tokens: mockTokens }));
    await store.dispatch(logoutThunk());
    expect(signout).toHaveBeenCalledWith("at");
    expect(store.getState().auth.user).toBeNull();
  });

  it("handles signout API failure gracefully", async () => {
    vi.mocked(signout).mockRejectedValueOnce(new Error("Logout failed"));
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(setUser({ user: mockUser, tokens: mockTokens }));
    await store.dispatch(logoutThunk());
    expect(store.getState().auth.user).toBeNull();
  });

  it("works when no access token", async () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    await store.dispatch(logoutThunk());
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});

// -------------------------------------------------------------------
// profileSlice
// -------------------------------------------------------------------
import profileReducer, {
  clearProfileError,
  resetPasswordAttempts,
  clearProfileData,
  updateProfileData,
  updateEmailAddress,
  changePassword,
  deleteUserAccount,
  resendVerificationEmail,
  retakeAssessmentAction,
} from "@/store/slices/profileSlice";
import * as profileService from "@/services/api/profileApi";

describe("profileSlice - reducers", () => {
  let state: ReturnType<typeof profileReducer>;

  beforeEach(() => {
    state = profileReducer(undefined, { type: "@@INIT" });
  });

  it("initial state is correct", () => {
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.passwordAttempts).toBe(0);
    expect(state.isAccountLocked).toBe(false);
  });

  it("clearProfileError clears error", () => {
    const withError = { ...state, error: "some error" };
    const next = profileReducer(withError, clearProfileError());
    expect(next.error).toBeNull();
  });

  it("resetPasswordAttempts resets attempt tracking", () => {
    const locked = { ...state, passwordAttempts: 3, isAccountLocked: true, lockoutExpiry: Date.now() };
    const next = profileReducer(locked, resetPasswordAttempts());
    expect(next.passwordAttempts).toBe(0);
    expect(next.isAccountLocked).toBe(false);
    expect(next.lockoutExpiry).toBeNull();
  });

  it("clearProfileData resets all", () => {
    const modified = { ...state, loading: true, error: "err", passwordAttempts: 2, isAccountLocked: true };
    const next = profileReducer(modified, clearProfileData());
    expect(next.loading).toBe(false);
    expect(next.error).toBeNull();
    expect(next.passwordAttempts).toBe(0);
    expect(next.isAccountLocked).toBe(false);
  });
});

describe("profileSlice - async thunks", () => {
  const createTestStore = () =>
    configureStore({ reducer: { profile: profileReducer } });

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => JSON.stringify({ auth: { tokens: { accessToken: "at" } } })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it("updateProfileData pending/fulfilled", async () => {
    vi.mocked(profileService.updateProfile).mockResolvedValueOnce(mockUser);
    const store = createTestStore();
    await store.dispatch(updateProfileData({ firstName: "Alice", lastName: "Smith" }));
    expect(store.getState().profile.loading).toBe(false);
    expect(store.getState().profile.error).toBeNull();
  });

  it("updateProfileData rejected", async () => {
    vi.mocked(profileService.updateProfile).mockRejectedValueOnce(new Error("Failed"));
    const store = createTestStore();
    await store.dispatch(updateProfileData({ firstName: "Alice", lastName: "Smith" }));
    expect(store.getState().profile.error).toBe("Failed");
  });

  it("updateEmailAddress pending/fulfilled", async () => {
    vi.mocked(profileService.updateEmail).mockResolvedValueOnce({ success: true } as any);
    const store = createTestStore();
    await store.dispatch(updateEmailAddress({ email: "new@test.com", currentEmail: "old@test.com" }));
    expect(store.getState().profile.error).toBeNull();
  });

  it("updateEmailAddress rejected", async () => {
    vi.mocked(profileService.updateEmail).mockRejectedValueOnce(new Error("Email error"));
    const store = createTestStore();
    await store.dispatch(updateEmailAddress({ email: "new@test.com", currentEmail: "old@test.com" }));
    expect(store.getState().profile.error).toBe("Email error");
  });

  it("changePassword fulfilled resets attempts", async () => {
    vi.mocked(profileService.updatePassword).mockResolvedValueOnce(undefined as any);
    const modifiedState = { loading: false, error: null, passwordAttempts: 3, isAccountLocked: false, lockoutExpiry: null };
    const store = configureStore({
      reducer: { profile: profileReducer },
      preloadedState: { profile: modifiedState },
    });
    await store.dispatch(changePassword({ currentPassword: "old", newPassword: "new", confirmNewPassword: "new" }));
    expect(store.getState().profile.passwordAttempts).toBe(0);
    expect(store.getState().profile.isAccountLocked).toBe(false);
  });

  it("changePassword rejected with attemptsRemaining", async () => {
    vi.mocked(profileService.updatePassword).mockRejectedValueOnce({
      message: "Wrong password",
      attemptsRemaining: 3,
    });
    const store = createTestStore();
    await store.dispatch(changePassword({ currentPassword: "old", newPassword: "new", confirmNewPassword: "new" }));
    expect(store.getState().profile.passwordAttempts).toBe(2); // 5 - 3
    expect(store.getState().profile.error).toBe("Wrong password");
  });

  it("changePassword rejected with lockout", async () => {
    vi.mocked(profileService.updatePassword).mockRejectedValueOnce({
      message: "Account locked",
      attemptsRemaining: 0,
      lockoutDuration: 900,
    });
    const store = createTestStore();
    await store.dispatch(changePassword({ currentPassword: "old", newPassword: "new", confirmNewPassword: "new" }));
    expect(store.getState().profile.isAccountLocked).toBe(true);
    expect(store.getState().profile.lockoutExpiry).toBeGreaterThan(Date.now());
  });

  it("deleteUserAccount fulfilled resets data", async () => {
    vi.mocked(profileService.deleteAccount).mockResolvedValueOnce(undefined);
    const store = createTestStore();
    await store.dispatch(deleteUserAccount("user-1"));
    expect(store.getState().profile.loading).toBe(false);
    expect(store.getState().profile.error).toBeNull();
    expect(store.getState().profile.passwordAttempts).toBe(0);
  });

  it("deleteUserAccount rejected", async () => {
    vi.mocked(profileService.deleteAccount).mockRejectedValueOnce(new Error("Delete failed"));
    const store = createTestStore();
    await store.dispatch(deleteUserAccount("user-1"));
    expect(store.getState().profile.error).toBe("Delete failed");
  });

  it("resendVerificationEmail fulfilled", async () => {
    vi.mocked(profileService.resendEmailVerification).mockResolvedValueOnce(undefined);
    const store = createTestStore();
    await store.dispatch(resendVerificationEmail());
    expect(store.getState().profile.loading).toBe(false);
  });

  it("resendVerificationEmail rejected", async () => {
    vi.mocked(profileService.resendEmailVerification).mockRejectedValueOnce(new Error("Resend failed"));
    const store = createTestStore();
    await store.dispatch(resendVerificationEmail());
    expect(store.getState().profile.error).toBe("Resend failed");
  });

  it("retakeAssessmentAction fulfilled", async () => {
    vi.mocked(profileService.retakeAssessment).mockResolvedValueOnce(undefined);
    const store = createTestStore();
    await store.dispatch(retakeAssessmentAction());
    expect(store.getState().profile.loading).toBe(false);
  });

  it("retakeAssessmentAction rejected", async () => {
    vi.mocked(profileService.retakeAssessment).mockRejectedValueOnce(new Error("Retake failed"));
    const store = createTestStore();
    await store.dispatch(retakeAssessmentAction());
    expect(store.getState().profile.error).toBe("Retake failed");
  });
});

// -------------------------------------------------------------------
// dashboardSlice
// -------------------------------------------------------------------
import dashboardReducer, {
  clearDashboard,
  clearDashboardError,
  resetDashboard,
  fetchDashboard,
} from "@/store/slices/dashboardSlice";
import { getDashboard } from "@/services/api/dashboardApi";

const mockDashboardData = { industry: { code: "c1", name: "Tech" } } as any;

describe("dashboardSlice", () => {
  it("initial state is correct", () => {
    const state = dashboardReducer(undefined, { type: "@@INIT" });
    expect(state.data).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.isLoaded).toBe(false);
  });

  it("clearDashboard resets data", () => {
    const loaded = dashboardReducer(undefined, fetchDashboard.fulfilled(mockDashboardData, "", undefined));
    const cleared = dashboardReducer(loaded, clearDashboard());
    expect(cleared.data).toBeNull();
    expect(cleared.isLoaded).toBe(false);
  });

  it("clearDashboardError clears error only", () => {
    const withError = { data: null, loading: false, error: "err", lastFetched: null, isLoaded: false };
    const next = dashboardReducer(withError, clearDashboardError());
    expect(next.error).toBeNull();
  });

  it("resetDashboard returns initial state", () => {
    const loaded = dashboardReducer(undefined, fetchDashboard.fulfilled(mockDashboardData, "", undefined));
    const reset = dashboardReducer(loaded, resetDashboard());
    expect(reset.data).toBeNull();
    expect(reset.isLoaded).toBe(false);
  });

  it("fetchDashboard pending/fulfilled/rejected", async () => {
    vi.mocked(getDashboard).mockResolvedValueOnce(mockDashboardData);
    const store = configureStore({ reducer: { dashboard: dashboardReducer } });
    await store.dispatch(fetchDashboard());
    const s = store.getState().dashboard;
    expect(s.data).toEqual(mockDashboardData);
    expect(s.isLoaded).toBe(true);
    expect(s.error).toBeNull();
  });

  it("fetchDashboard rejected sets error", async () => {
    vi.mocked(getDashboard).mockRejectedValueOnce(new Error("API error"));
    const store = configureStore({ reducer: { dashboard: dashboardReducer } });
    await store.dispatch(fetchDashboard());
    expect(store.getState().dashboard.error).toBe("API error");
    expect(store.getState().dashboard.isLoaded).toBe(false);
  });

  it("resets on auth/logout action", () => {
    const loaded = dashboardReducer(undefined, fetchDashboard.fulfilled(mockDashboardData, "", undefined));
    const reset = dashboardReducer(loaded, { type: "auth/logout" });
    expect(reset.data).toBeNull();
  });
});

// -------------------------------------------------------------------
// industrySlice
// -------------------------------------------------------------------
import industryReducer, {
  clearIndustry,
  clearIndustryError,
  resetIndustry,
  fetchIndustry,
} from "@/store/slices/industrySlice";
import { getIndustry } from "@/services/api/industryApi";

const mockIndustryData = { code: "tech", name: "Technology" } as any;

describe("industrySlice", () => {
  it("initial state is correct", () => {
    const s = industryReducer(undefined, { type: "@@INIT" });
    expect(s.data).toBeNull();
    expect(s.loading).toBe(false);
    expect(s.isLoaded).toBe(false);
  });

  it("clearIndustry resets data", () => {
    const loaded = industryReducer(undefined, fetchIndustry.fulfilled(mockIndustryData, "", undefined));
    const cleared = industryReducer(loaded, clearIndustry());
    expect(cleared.data).toBeNull();
    expect(cleared.isLoaded).toBe(false);
  });

  it("clearIndustryError clears error", () => {
    const withError = { data: null, loading: false, error: "err", isLoaded: false };
    const next = industryReducer(withError, clearIndustryError());
    expect(next.error).toBeNull();
  });

  it("resetIndustry returns initial state", () => {
    const loaded = industryReducer(undefined, fetchIndustry.fulfilled(mockIndustryData, "", undefined));
    const reset = industryReducer(loaded, resetIndustry());
    expect(reset.data).toBeNull();
  });

  it("fetchIndustry fulfilled", async () => {
    vi.mocked(getIndustry).mockResolvedValueOnce(mockIndustryData);
    const store = configureStore({ reducer: { industry: industryReducer } });
    await store.dispatch(fetchIndustry());
    expect(store.getState().industry.data).toEqual(mockIndustryData);
    expect(store.getState().industry.isLoaded).toBe(true);
  });

  it("fetchIndustry rejected", async () => {
    vi.mocked(getIndustry).mockRejectedValueOnce(new Error("Industry error"));
    const store = configureStore({ reducer: { industry: industryReducer } });
    await store.dispatch(fetchIndustry());
    expect(store.getState().industry.error).toBe("Industry error");
  });

  it("resets on auth/logout", () => {
    const loaded = industryReducer(undefined, fetchIndustry.fulfilled(mockIndustryData, "", undefined));
    const reset = industryReducer(loaded, { type: "auth/logout" });
    expect(reset.data).toBeNull();
  });
});

// -------------------------------------------------------------------
// workforceSlice
// -------------------------------------------------------------------
import workforceReducer, {
  clearWorkforce,
  clearWorkforceError,
  resetWorkforce,
  fetchWorkforce,
} from "@/store/slices/workforceSlice";
import { getWorkforce } from "@/services/api/workforceApi";

const mockWorkforceData = { totalEmployees: 100 } as any;

describe("workforceSlice", () => {
  it("initial state is correct", () => {
    const s = workforceReducer(undefined, { type: "@@INIT" });
    expect(s.data).toBeNull();
    expect(s.loading).toBe(false);
    expect(s.isLoaded).toBe(false);
  });

  it("clearWorkforce resets data", () => {
    const loaded = workforceReducer(undefined, fetchWorkforce.fulfilled(mockWorkforceData, "", undefined));
    const cleared = workforceReducer(loaded, clearWorkforce());
    expect(cleared.data).toBeNull();
  });

  it("clearWorkforceError clears error", () => {
    const withError = { data: null, loading: false, error: "err", lastFetched: null, isLoaded: false };
    const next = workforceReducer(withError, clearWorkforceError());
    expect(next.error).toBeNull();
  });

  it("resetWorkforce returns initial state", () => {
    const loaded = workforceReducer(undefined, fetchWorkforce.fulfilled(mockWorkforceData, "", undefined));
    const reset = workforceReducer(loaded, resetWorkforce());
    expect(reset.data).toBeNull();
  });

  it("fetchWorkforce fulfilled", async () => {
    vi.mocked(getWorkforce).mockResolvedValueOnce(mockWorkforceData);
    const store = configureStore({ reducer: { workforce: workforceReducer } });
    await store.dispatch(fetchWorkforce());
    expect(store.getState().workforce.data).toEqual(mockWorkforceData);
    expect(store.getState().workforce.isLoaded).toBe(true);
  });

  it("fetchWorkforce rejected", async () => {
    vi.mocked(getWorkforce).mockRejectedValueOnce(new Error("Workforce error"));
    const store = configureStore({ reducer: { workforce: workforceReducer } });
    await store.dispatch(fetchWorkforce());
    expect(store.getState().workforce.error).toBe("Workforce error");
  });
});

// -------------------------------------------------------------------
// recommendationsSlice
// -------------------------------------------------------------------
import recommendationsReducer, {
  clearRecommendations,
  clearRecommendationsError,
  resetRecommendations,
  fetchRecommendations,
} from "@/store/slices/recommendationsSlice";
import { getRecommendations } from "@/services/api/recommendationsApi";

const mockRecsData = { recommendations: [{ id: 1, title: "Rec 1" }] } as any;

describe("recommendationsSlice", () => {
  it("initial state is correct", () => {
    const s = recommendationsReducer(undefined, { type: "@@INIT" });
    expect(s.data).toBeNull();
    expect(s.loading).toBe(false);
  });

  it("clearRecommendations resets", () => {
    const loaded = recommendationsReducer(undefined, fetchRecommendations.fulfilled(mockRecsData, "", undefined));
    const cleared = recommendationsReducer(loaded, clearRecommendations());
    expect(cleared.data).toBeNull();
  });

  it("clearRecommendationsError clears error", () => {
    const withError = { data: null, loading: false, error: "err", lastFetched: null, isLoaded: false };
    const next = recommendationsReducer(withError, clearRecommendationsError());
    expect(next.error).toBeNull();
  });

  it("resetRecommendations returns initial state", () => {
    const loaded = recommendationsReducer(undefined, fetchRecommendations.fulfilled(mockRecsData, "", undefined));
    const reset = recommendationsReducer(loaded, resetRecommendations());
    expect(reset.data).toBeNull();
  });

  it("fetchRecommendations fulfilled", async () => {
    vi.mocked(getRecommendations).mockResolvedValueOnce(mockRecsData);
    const store = configureStore({ reducer: { recommendations: recommendationsReducer } });
    await store.dispatch(fetchRecommendations());
    expect(store.getState().recommendations.data).toEqual(mockRecsData);
  });

  it("fetchRecommendations rejected", async () => {
    vi.mocked(getRecommendations).mockRejectedValueOnce(new Error("Rec error"));
    const store = configureStore({ reducer: { recommendations: recommendationsReducer } });
    await store.dispatch(fetchRecommendations());
    expect(store.getState().recommendations.error).toBe("Rec error");
  });

  it("resets on auth/logout", () => {
    const loaded = recommendationsReducer(undefined, fetchRecommendations.fulfilled(mockRecsData, "", undefined));
    const reset = recommendationsReducer(loaded, { type: "auth/logout" });
    expect(reset.data).toBeNull();
  });
});

// -------------------------------------------------------------------
// finchStatusSlice
// -------------------------------------------------------------------
import finchStatusReducer, {
  resetFinchStatus,
  fetchFinchStatus,
} from "@/store/slices/finchStatusSlice";
import { getFinchStatus } from "@/services/api/finchApi";

const mockFinchData = {
  connection: { connectionId: "c1", connectionStatus: "connected", products: [], payFrequency: null },
  latestSyncJob: null,
};

describe("finchStatusSlice", () => {
  it("initial state is correct", () => {
    const s = finchStatusReducer(undefined, { type: "@@INIT" });
    expect(s.connection).toBeNull();
    expect(s.latestSyncJob).toBeNull();
    expect(s.loading).toBe(false);
  });

  it("resetFinchStatus returns initial state", () => {
    const loaded = finchStatusReducer(undefined, fetchFinchStatus.fulfilled(mockFinchData as any, "", undefined));
    const reset = finchStatusReducer(loaded, resetFinchStatus());
    expect(reset.connection).toBeNull();
  });

  it("fetchFinchStatus fulfilled", async () => {
    vi.mocked(getFinchStatus).mockResolvedValueOnce(mockFinchData as any);
    const store = configureStore({ reducer: { finchStatus: finchStatusReducer } });
    await store.dispatch(fetchFinchStatus());
    expect(store.getState().finchStatus.connection).toEqual(mockFinchData.connection);
    expect(store.getState().finchStatus.latestSyncJob).toBeNull();
    expect(store.getState().finchStatus.loading).toBe(false);
  });

  it("fetchFinchStatus rejected", async () => {
    vi.mocked(getFinchStatus).mockRejectedValueOnce(new Error("Finch error"));
    const store = configureStore({ reducer: { finchStatus: finchStatusReducer } });
    await store.dispatch(fetchFinchStatus());
    expect(store.getState().finchStatus.error).toBe("Finch error");
  });

  it("resets on auth/logout", () => {
    const loaded = finchStatusReducer(undefined, fetchFinchStatus.fulfilled(mockFinchData as any, "", undefined));
    const reset = finchStatusReducer(loaded, { type: "auth/logout" });
    expect(reset.connection).toBeNull();
  });
});

// -------------------------------------------------------------------
// registrationFormSlice
// -------------------------------------------------------------------
import registrationFormReducer, {
  saveFormData,
  clearFormData,
} from "@/store/slices/registrationFormSlice";

describe("registrationFormSlice", () => {
  it("initial state has empty formData", () => {
    const s = registrationFormReducer(undefined, { type: "@@INIT" });
    expect(s.formData).toEqual({});
  });

  it("saveFormData merges data", () => {
    let s = registrationFormReducer(undefined, saveFormData({ firstName: "Alice" }));
    s = registrationFormReducer(s, saveFormData({ lastName: "Smith" }));
    expect(s.formData.firstName).toBe("Alice");
    expect(s.formData.lastName).toBe("Smith");
  });

  it("clearFormData resets to empty", () => {
    let s = registrationFormReducer(undefined, saveFormData({ firstName: "Alice" }));
    s = registrationFormReducer(s, clearFormData());
    expect(s.formData).toEqual({});
  });
});

// -------------------------------------------------------------------
// userSlice
// -------------------------------------------------------------------
import userReducer, { fetchUserById } from "@/store/slices/userSlice";
import { getUserById } from "@/services/api/userApi";

const mockUserData = {
  id: "u-1",
  firstName: "Alice",
  lastName: "Smith",
  businessEmail: "alice@test.com",
  emailVerify: true,
  updatedAt: new Date().toISOString(),
} as any;

describe("userSlice", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => JSON.stringify({
        auth: { user: { id: "u-1", businessEmail: "old@test.com" } },
      })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("initial state is correct", () => {
    const s = userReducer(undefined, { type: "@@INIT" });
    expect(s.data).toBeNull();
    expect(s.loading).toBe(false);
  });

  it("fetchUserById pending sets loading", () => {
    const s = userReducer(undefined, fetchUserById.pending("", { userId: "u-1", token: "t" }));
    expect(s.loading).toBe(true);
    expect(s.error).toBeNull();
  });

  it("fetchUserById fulfilled sets data", async () => {
    vi.mocked(getUserById).mockResolvedValueOnce(mockUserData);
    const authStore = configureStore({ reducer: { auth: authReducer, user: userReducer } });
    authStore.dispatch(setUser({ user: mockUser, tokens: mockTokens }));
    await authStore.dispatch(fetchUserById({ userId: "u-1", token: "at" }));
    expect(authStore.getState().user.data).toEqual(mockUserData);
  });

  it("fetchUserById rejected sets error", async () => {
    vi.mocked(getUserById).mockRejectedValueOnce(new Error("Not found"));
    const store = configureStore({ reducer: { auth: authReducer, user: userReducer } });
    await store.dispatch(fetchUserById({ userId: "u-1", token: "at" }));
    expect(store.getState().user.error).toBe("Failed to fetch user data");
  });

  it("fetchUserById fulfilled when no userDetail in localStorage", async () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    vi.mocked(getUserById).mockResolvedValueOnce(mockUserData);
    const store = configureStore({ reducer: { auth: authReducer, user: userReducer } });
    await store.dispatch(fetchUserById({ userId: "u-1", token: "at" }));
    expect(store.getState().user.data).toEqual(mockUserData);
  });
});
