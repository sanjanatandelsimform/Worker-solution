/**
 * DashboardPage Error Handling Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../test-utils";

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => ({
    completionCount: 0,
    isLoading: false,
    error: "Assessment fetch failed",
    assessmentData: { assessmentType: "finch", data: { status: "completed" } },
    isFinchCompleted: false,
    isFinchAssessmentIncomplete: false,
    sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useFinchConnect", () => ({
  useFinchConnect: () => ({
    connectWithFinch: vi.fn(),
    isLoading: false,
    isPageLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: () => ({
    inProgressModal: { isOpen: false, onClose: vi.fn(), onAction: vi.fn() },
    completeModal: { isOpen: false, onClose: vi.fn(), onAction: vi.fn() },
  }),
}));

vi.mock("@/components/modals/BaseModalWithIcon", () => ({ BaseModalWithIcon: () => null }));
vi.mock("@/components/common/ErrorMessage", () => ({ default: () => null }));
vi.mock("@/components/common/Declarations", () => ({ default: () => null }));
vi.mock("@/components/dashboard/DashboardSidebar", () => ({
  DashboardSidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock("@/pages/benchmark/BenchmarkPage", () => ({ default: () => <div>BenchmarkPage</div> }));
vi.mock("@/pages/recommendations/RecommendationsFinchPage", () => ({ default: () => null }));
vi.mock("@/pages/benchmark/BenchmarkFinchPage", () => ({ default: () => null }));
vi.mock("@/pages/workforce/WorkforcePage", () => ({ default: () => null }));

vi.mock("@/assets/mail-icon.svg", () => ({ default: "mail-icon.svg" }));
vi.mock("@/assets/finch-logo.svg", () => ({ default: "finch-logo.svg" }));
vi.mock("@/assets/fpo-hero-image.png", () => ({ default: "fpo-hero.png" }));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: "/dashboard" }),
  };
});

const { default: DashboardPage } = await import("@/pages/dashboard/DashboardPage");

function renderDashboard() {
  const store = createTestStore({
    auth: {
      user: {
        id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        businessName: "Acme",
        businessEmail: "jane@acme.com",
        emailVerify: true,
        zipCode: 94102,
        industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
      },
      tokens: { accessToken: "at", refreshToken: "rt" },
      isAuthenticated: true,
      authInitAttempted: true,
    },
  } as any);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("DashboardPage Error Handling", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should render despite assessment errors", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
    });
  });
});
