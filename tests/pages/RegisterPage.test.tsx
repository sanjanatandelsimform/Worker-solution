/**
 * RegisterPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { getIndustries } from "@/services/api/authApi";
import { createTestStore } from "../test-utils";

vi.mock("@/services/api/authApi", () => ({
  signup: vi.fn(),
  getIndustries: vi.fn(),
}));

vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));

const mockGetIndustries = vi.mocked(getIndustries);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegisterPage() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIndustries.mockResolvedValue({
      data: { industries: [{ id: 1, industry_name: "Technology", industry_code: "TECH" }] },
    });
  });

  it("should render sign up heading", async () => {
    renderRegisterPage();
    await waitFor(() => {
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });
  });

  it("should render form fields", async () => {
    renderRegisterPage();
    await waitFor(() => {
      expect(screen.getByText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
    });
  });

  it("should fetch industries on mount", async () => {
    renderRegisterPage();
    await waitFor(() => {
      expect(mockGetIndustries).toHaveBeenCalled();
    });
  });
});
