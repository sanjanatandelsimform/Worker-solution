import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../../test-utils";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";

vi.mock("@/components/common/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      ...mockAxiosInstance,
    },
    AxiosError: class AxiosError extends Error {},
  };
});

const STORAGE_KEY = "userDetail";

const NO_AUTH_STATE = {
  auth: {
    tokens: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    assessmentStatus: null,
    assessmentData: null,
    signUpLoading: false,
    signUpError: null,
    signUpSuccess: false,
  } as any,
};

function renderProtectedRoute(
  preloadedState: Record<string, any>,
  props: Record<string, any> = {},
  initialEntries = ["/protected"]
) {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute {...props}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/sign-in" element={<div>Sign In Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/verify" element={<div>Verify Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("redirects to /sign-in when no tokens in Redux or localStorage", () => {
    renderProtectedRoute(NO_AUTH_STATE);
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
  });

  it("redirects to custom redirectTo path", () => {
    renderProtectedRoute(NO_AUTH_STATE, { redirectTo: "/login" });
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("shows loading spinner when tokens exist but user is null", () => {
    renderProtectedRoute({
      auth: {
        tokens: { accessToken: "abc", refreshToken: "def" },
        user: null,
        isAuthenticated: true,
        loading: false,
        error: null,
        assessmentStatus: null,
        assessmentData: null,
        signUpLoading: false,
        signUpError: null,
        signUpSuccess: false,
      } as any,
    });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated with tokens and user", () => {
    renderProtectedRoute({
      auth: {
        tokens: { accessToken: "abc", refreshToken: "def" },
        user: {
          id: "1",
          email: "test@test.com",
          emailVerify: true,
          firstName: "Test",
          lastName: "User",
        },
        isAuthenticated: true,
        loading: false,
        error: null,
        assessmentStatus: null,
        assessmentData: null,
        signUpLoading: false,
        signUpError: null,
        signUpSuccess: false,
      } as any,
    });
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects when email not verified and requireEmailVerified is true", () => {
    renderProtectedRoute(
      {
        auth: {
          tokens: { accessToken: "abc", refreshToken: "def" },
          user: {
            id: "1",
            email: "test@test.com",
            emailVerify: false,
            firstName: "Test",
            lastName: "User",
          },
          isAuthenticated: true,
          loading: false,
          error: null,
          assessmentStatus: null,
          assessmentData: null,
          signUpLoading: false,
          signUpError: null,
          signUpSuccess: false,
        } as any,
      },
      { requireEmailVerified: true, emailNotVerifiedRedirectTo: "/verify" }
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Verify Page")).toBeInTheDocument();
  });

  it("renders children when email verified and requireEmailVerified is true", () => {
    renderProtectedRoute(
      {
        auth: {
          tokens: { accessToken: "abc", refreshToken: "def" },
          user: {
            id: "1",
            email: "test@test.com",
            emailVerify: true,
            firstName: "Test",
            lastName: "User",
          },
          isAuthenticated: true,
          loading: false,
          error: null,
          assessmentStatus: null,
          assessmentData: null,
          signUpLoading: false,
          signUpError: null,
          signUpSuccess: false,
        } as any,
      },
      { requireEmailVerified: true }
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("uses localStorage tokens as fallback when Redux has none", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        auth: { tokens: { accessToken: "stored-token", refreshToken: "stored-refresh" } },
      })
    );
    renderProtectedRoute(NO_AUTH_STATE);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("handles malformed localStorage data gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json");
    renderProtectedRoute(NO_AUTH_STATE);
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
  });

  it("handles localStorage with missing token fields", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ auth: { tokens: {} } }));
    renderProtectedRoute(NO_AUTH_STATE);
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
  });
});
