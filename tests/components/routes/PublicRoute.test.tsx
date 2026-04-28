import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import { PublicRoute } from "@/components/routes/PublicRoute";

describe("PublicRoute", () => {
  it("renders children when not authenticated", () => {
    renderWithProviders(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>,
      {
        preloadedState: {
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
        },
      }
    );
    expect(screen.getByText("Public Content")).toBeInTheDocument();
  });

  it("redirects to /dashboard when authenticated", () => {
    renderWithProviders(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>,
      {
        preloadedState: {
          auth: {
            tokens: { accessToken: "abc", refreshToken: "def" },
            user: { id: "1", email: "test@test.com" },
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
      }
    );
    expect(screen.queryByText("Public Content")).not.toBeInTheDocument();
  });

  it("redirects to custom path when authenticated", () => {
    renderWithProviders(
      <PublicRoute redirectTo="/home">
        <div>Public Content</div>
      </PublicRoute>,
      {
        preloadedState: {
          auth: {
            tokens: { accessToken: "abc", refreshToken: "def" },
            user: { id: "1" },
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
      }
    );
    expect(screen.queryByText("Public Content")).not.toBeInTheDocument();
  });
});
