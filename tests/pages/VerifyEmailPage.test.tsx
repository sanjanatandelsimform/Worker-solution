/**
 * VerifyEmailPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { verifyEmail } from "@/services/api/authApi";
import { createTestStore } from "../test-utils";

vi.mock("@/services/api/authApi", () => ({
  verifyEmail: vi.fn(),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));

const mockVerifyEmail = vi.mocked(verifyEmail);

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

function renderVerifyEmailPage() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("should show error when no token", async () => {
    renderVerifyEmailPage();
    await waitFor(() => {
      expect(screen.getByText(/Verification failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid or missing verification token/)).toBeInTheDocument();
    });
  });

  it("should show back to sign in button on error", async () => {
    renderVerifyEmailPage();
    await waitFor(() => {
      expect(screen.getByText(/Back to sign in/i)).toBeInTheDocument();
    });
  });

  it("should show loading spinner initially with token", () => {
    mockSearchParams = new URLSearchParams("token=test-token");
    mockVerifyEmail.mockImplementation(() => new Promise(() => {})); // never resolves
    renderVerifyEmailPage();
    expect(screen.getByLabelText("oval-loading")).toBeInTheDocument();
  });

  it("should navigate to dashboard on success", async () => {
    mockSearchParams = new URLSearchParams("token=test-token");
    mockVerifyEmail.mockResolvedValueOnce({
      user: {
        id: "user-1",
        businessEmail: "test@test.com",
        emailVerify: true,
      },
      tokens: { accessToken: "at", refreshToken: "rt" },
    });

    renderVerifyEmailPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        state: { emailVerified: true },
        replace: true,
      });
    });
  });

  it("should show error when verification fails", async () => {
    mockSearchParams = new URLSearchParams("token=bad-token");
    mockVerifyEmail.mockRejectedValueOnce(new Error("Token expired"));

    renderVerifyEmailPage();

    await waitFor(() => {
      expect(screen.getByText(/Verification failed/i)).toBeInTheDocument();
      expect(screen.getByText("Token expired")).toBeInTheDocument();
    });
  });
});
