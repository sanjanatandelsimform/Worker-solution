/**
 * DashboardPage — Comprehensive Tests
 *
 * Covers all rendering branches, loading states, email verification flows,
 * assessment states, Finch connection states, tab navigation, error display,
 * modal interactions, and button interactions.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../test-utils";

// ─── Hoisted mutable mock factories ──────────────────────────────────────────
const {
  mockUseAssessmentStatus,
  mockUseFinchConnect,
  mockUseFinchStatus,
  mockConnectWithFinch,
  mockClearFinchError,
} = vi.hoisted(() => ({
  mockUseAssessmentStatus: vi.fn(),
  mockUseFinchConnect: vi.fn(),
  mockUseFinchStatus: vi.fn(),
  mockConnectWithFinch: vi.fn(),
  mockClearFinchError: vi.fn(),
}));

// ─── Hook mocks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => mockUseAssessmentStatus(),
}));

vi.mock("@/hooks/useFinchConnect", () => ({
  useFinchConnect: () => mockUseFinchConnect(),
}));

vi.mock("@/hooks/useFinchStatus", () => ({
  useFinchStatus: () => mockUseFinchStatus(),
}));

vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: vi.fn(() => ({ title: "", subtitle: "", buttons: [] })),
}));

// ─── Component mocks ──────────────────────────────────────────────────────────
vi.mock("@/components/common/LoadingSpinner", () => ({
  LoadingSpinner: ({ ariaLabel }: { ariaLabel?: string }) => (
    <div data-testid="loading-spinner" aria-label={ariaLabel} />
  ),
}));

vi.mock("@/components/modals/BaseModalWithIcon", () => ({
  BaseModalWithIcon: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="base-modal" /> : null,
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage, onClose }: { errorMessage: string; onClose: () => void }) => (
    <div data-testid="error-message">
      <span>{errorMessage}</span>
      <button onClick={onClose} data-testid="error-close-btn">
        Close
      </button>
    </div>
  ),
}));

vi.mock("@/components/common/Declarations", () => ({
  default: () => <div data-testid="declarations" />,
}));

vi.mock("@/components/dashboard/DashboardSidebar", () => ({
  DashboardSidebar: () => <div data-testid="sidebar" />,
}));

// Functional Tabs mock — preserves selectedKey on the wrapper and allows tab clicks
vi.mock("@/components/base/tabs/tabs", () => {
  const Tabs = ({
    children,
    selectedKey,
    onSelectionChange,
  }: {
    children: React.ReactNode;
    selectedKey: string;
    onSelectionChange: (key: string) => void;
  }) => {
    const childrenWithHandler = React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child;
      }

      return React.cloneElement(child, {
        onSelectionChange,
      });
    });

    return (
      <div data-testid="tabs" data-selected-key={selectedKey}>
        {childrenWithHandler}
      </div>
    );
  };

  Tabs.List = ({
    items,
    onSelectionChange,
  }: {
    items: { id: string; label: string }[];
    onSelectionChange?: (key: string) => void;
  }) => (
    <div data-testid="tabs-list">
      {items?.map(item => (
        <button
          key={item.id}
          data-testid={`tab-${item.id}`}
          onClick={() => onSelectionChange?.(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  Tabs.Panel = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <div data-testid={`tab-panel-${id}`}>{children}</div>
  );

  return { Tabs };
});

vi.mock("@/pages/benchmark/BenchmarkPage", () => ({
  default: () => <div data-testid="benchmark-page" />,
}));
vi.mock("@/pages/recommendations/RecommendationsFinchPage", () => ({
  default: () => <div data-testid="recommendations-finch-page" />,
}));
vi.mock("@/pages/benchmark/BenchmarkFinchPage", () => ({
  default: () => <div data-testid="benchmark-finch-page" />,
}));
vi.mock("@/pages/workforce/WorkforcePage", () => ({
  default: () => <div data-testid="workforce-page" />,
}));

// ─── Asset mocks ──────────────────────────────────────────────────────────────
vi.mock("@/assets/mail-icon.svg", () => ({ default: "mail-icon.svg" }));
vi.mock("@/assets/finch-logo.svg", () => ({ default: "finch-logo.svg" }));
vi.mock("@/assets/fpo-hero-image.png", () => ({ default: "fpo-hero.png" }));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "checkmark.svg" }));
vi.mock("@/assets/alert-icon.svg", () => ({ default: "alert.svg" }));

// ─── Service mocks (prevent real HTTP from thunks) ────────────────────────────
vi.mock("@/services/api/workforceApi", () => ({
  getWorkforce: vi.fn().mockResolvedValue({ success: false, data: null }),
}));
vi.mock("@/services/api/recommendationsApi", () => ({
  getRecommendations: vi.fn().mockResolvedValue({ success: false, data: null }),
}));
vi.mock("@/services/api/userApi", () => ({
  getUserById: vi.fn().mockResolvedValue({ success: false, data: null }),
}));

// ─── Router mock ──────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: "/dashboard" }),
  };
});

// ─── Import after all mocks ───────────────────────────────────────────────────
const { default: DashboardPage } = await import("@/pages/dashboard/DashboardPage");

// ─── Shared test data ─────────────────────────────────────────────────────────
const BASE_USER = {
  id: "user-1",
  firstName: "Jane",
  lastName: "Doe",
  businessName: "Acme Corp",
  businessEmail: "jane@acme.com",
  emailVerify: true,
  zipCode: 94102,
  industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
};

const DEFAULT_ASSESSMENT_STATUS = {
  completionCount: 0,
  isLoading: false,
  error: null,
  assessmentData: null,
  isFinchCompleted: false,
  isFinchAssessmentIncomplete: false,
  sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
  refetch: vi.fn(),
};

const DEFAULT_FINCH_CONNECT = {
  connectWithFinch: mockConnectWithFinch,
  isLoading: false,
  isPageLoading: false,
  error: null,
  clearError: mockClearFinchError,
};

const DEFAULT_FINCH_STATUS = {
  connectionStatus: null,
  syncJobStatus: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

const COMPLETED_ASSESSMENT = {
  data: { status: "completed", sections: {} },
  assessmentType: "manual",
};

// ─── Render helper ────────────────────────────────────────────────────────────
function renderDashboard(userOverrides: Partial<typeof BASE_USER> = {}) {
  const store = createTestStore({
    auth: {
      user: { ...BASE_USER, ...userOverrides },
      tokens: { accessToken: "at", refreshToken: "rt" },
      isAuthenticated: true,
      authInitAttempted: true,
    },
  } as any);

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAssessmentStatus.mockReturnValue({ ...DEFAULT_ASSESSMENT_STATUS });
    mockUseFinchConnect.mockReturnValue({ ...DEFAULT_FINCH_CONNECT });
    mockUseFinchStatus.mockReturnValue({ ...DEFAULT_FINCH_STATUS });
  });

  // ── Loading States ──────────────────────────────────────────────────────────
  describe("Loading States", () => {
    it("shows loading spinner when assessment data is loading", () => {
      mockUseAssessmentStatus.mockReturnValue({ ...DEFAULT_ASSESSMENT_STATUS, isLoading: true });
      renderDashboard();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByTestId("loading-spinner")).toHaveAttribute("aria-label", "oval-loading");
    });

    it("shows loading spinner when Finch page operation is loading", () => {
      mockUseFinchConnect.mockReturnValue({ ...DEFAULT_FINCH_CONNECT, isPageLoading: true });
      renderDashboard();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("does not render sidebar during loading", () => {
      mockUseAssessmentStatus.mockReturnValue({ ...DEFAULT_ASSESSMENT_STATUS, isLoading: true });
      renderDashboard();
      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    });

    it("does not render main content during loading", () => {
      mockUseAssessmentStatus.mockReturnValue({ ...DEFAULT_ASSESSMENT_STATUS, isLoading: true });
      renderDashboard();
      expect(screen.queryByText(/Welcome/i)).not.toBeInTheDocument();
    });

    it("does not show spinner when both loading flags are false", () => {
      renderDashboard();
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  describe("Sidebar", () => {
    it("renders sidebar when not in a loading state", () => {
      renderDashboard();
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
  });

  // ── Unverified Email ────────────────────────────────────────────────────────
  describe("Unverified Email", () => {
    it("shows Verify your email DashboardCard title", () => {
      renderDashboard({ emailVerify: false });
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
    });

    it("shows email verification description text", () => {
      renderDashboard({ emailVerify: false });
      expect(
        screen.getByText(/Verify your email to unlock all A2B features/i)
      ).toBeInTheDocument();
    });

    it("shows generic overview paragraph when unverified", () => {
      renderDashboard({ emailVerify: false });
      expect(
        screen.getByText(/A2B provides an overview of your workforce, industry/i)
      ).toBeInTheDocument();
    });

    it("shows Declarations component when email is not verified", () => {
      renderDashboard({ emailVerify: false });
      expect(screen.getByTestId("declarations")).toBeInTheDocument();
    });

    it("does NOT show Take the assessment card when unverified", () => {
      renderDashboard({ emailVerify: false });
      expect(screen.queryByText("Take the assessment")).not.toBeInTheDocument();
    });

    it("does NOT show Start with Finch button when unverified", () => {
      renderDashboard({ emailVerify: false });
      expect(screen.queryByText("Start with Finch")).not.toBeInTheDocument();
    });

    it("does NOT show Let's get started button when unverified", () => {
      renderDashboard({ emailVerify: false });
      expect(screen.queryByText("Let's get started")).not.toBeInTheDocument();
    });

    it("does NOT show tabs when unverified", () => {
      renderDashboard({ emailVerify: false });
      expect(screen.queryByTestId("tabs")).not.toBeInTheDocument();
    });
  });

  // ── Verified — No Assessment, Not Connected (completionCount = 0) ───────────
  describe("Verified email, no assessment started, not Finch-connected", () => {
    it("shows Welcome greeting with the user's first name", () => {
      renderDashboard();
      expect(screen.getByText("Welcome, Jane!")).toBeInTheDocument();
    });

    it("shows connect-payroll description paragraph", () => {
      renderDashboard();
      expect(
        screen.getByText(/Connect your payroll to A2B with Finch or manually/i)
      ).toBeInTheDocument();
    });

    it("shows Take the assessment DashboardCard", () => {
      renderDashboard();
      expect(screen.getByText("Take the assessment")).toBeInTheDocument();
    });

    it("shows Finch connect panel with Start with Finch button", () => {
      renderDashboard();
      expect(screen.getByText("Start with Finch")).toBeInTheDocument();
    });

    it("shows Manual entry panel with Let\u2019s get started button", () => {
      renderDashboard();
      expect(screen.getByText(/let.s get started/i)).toBeInTheDocument();
    });

    it("shows Finch connection description text", () => {
      renderDashboard();
      expect(screen.getByText(/Finch handles the connection for you/i)).toBeInTheDocument();
    });

    it("shows Manual entry description text", () => {
      renderDashboard();
      expect(screen.getByText(/Fill out a simple assessment form/i)).toBeInTheDocument();
    });

    it("shows Declarations component at the bottom", () => {
      renderDashboard();
      expect(screen.getByTestId("declarations")).toBeInTheDocument();
    });

    it("clicking Let\u2019s get started navigates to /assessment", () => {
      renderDashboard();
      fireEvent.click(screen.getByText(/let.s get started/i));
      expect(mockNavigate).toHaveBeenCalledWith("/assessment");
    });

    it("clicking Start with Finch invokes connectWithFinch", () => {
      renderDashboard();
      fireEvent.click(screen.getByText("Start with Finch"));
      expect(mockConnectWithFinch).toHaveBeenCalledTimes(1);
    });

    it("does NOT call connectWithFinch when isFinchLoading is true and button is clicked", () => {
      mockUseFinchConnect.mockReturnValue({ ...DEFAULT_FINCH_CONNECT, isLoading: true });
      renderDashboard();
      // Button is disabled — clicking it should not trigger the handler
      const btn = screen.getByText("Start with Finch").closest("button");
      if (btn) fireEvent.click(btn);
      expect(mockConnectWithFinch).not.toHaveBeenCalled();
    });

    it("does NOT show tabs when assessment is not started and not connected", () => {
      renderDashboard();
      expect(screen.queryByTestId("tabs")).not.toBeInTheDocument();
    });

    it("shows finch connect/manual panels (Free label visible twice)", () => {
      renderDashboard();
      expect(screen.getAllByText("Free").length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Verified — Partial Assessment (completionCount > 0), Not Connected ───────
  describe("Verified email, assessment partially completed", () => {
    beforeEach(() => {
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 2,
      });
    });

    it("shows Complete your assessment banner heading", () => {
      renderDashboard();
      expect(screen.getByText("Complete your assessment")).toBeInTheDocument();
    });

    it("shows pick-up description in the banner", () => {
      renderDashboard();
      expect(screen.getByText(/Pick up where you left off/i)).toBeInTheDocument();
    });

    it("shows Continue button (not Start assessment)", () => {
      renderDashboard();
      expect(screen.getByText("Continue")).toBeInTheDocument();
      expect(screen.queryByText("Start assessment")).not.toBeInTheDocument();
    });

    it("does NOT show Finch/Manual entry options when assessment is in progress", () => {
      renderDashboard();
      expect(screen.queryByText("Start with Finch")).not.toBeInTheDocument();
      expect(screen.queryByText("Let's get started")).not.toBeInTheDocument();
    });

    it("does NOT show tabs while assessment is incomplete and not connected", () => {
      renderDashboard();
      expect(screen.queryByTestId("tabs")).not.toBeInTheDocument();
    });
  });

  // ── Verified — Assessment Completed (manual), Not Finch-Connected ───────────
  describe("Verified email, assessment completed manually, not Finch-connected", () => {
    beforeEach(() => {
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 4,
        assessmentData: { ...COMPLETED_ASSESSMENT },
        isFinchCompleted: false,
        isFinchAssessmentIncomplete: false,
      });
    });

    it("shows Hi, FirstName! greeting (completed state)", () => {
      renderDashboard();
      expect(screen.getByText(/Hi, Jane!/i)).toBeInTheDocument();
    });

    it("shows manual overview paragraph", () => {
      renderDashboard();
      expect(
        screen.getByText(/Here's an overview of your workforce, industry/i)
      ).toBeInTheDocument();
    });

    it("shows Recommendations tab", () => {
      renderDashboard();
      expect(screen.getByTestId("tab-finchRecommendations")).toBeInTheDocument();
      expect(screen.getByText("Recommendations")).toBeInTheDocument();
    });

    it("shows Industry tab (manual — non-Finch)", () => {
      renderDashboard();
      expect(screen.getByTestId("tab-industry")).toBeInTheDocument();
      expect(screen.getByText("Industry")).toBeInTheDocument();
    });

    it("does NOT show Workforce tab (Finch-specific)", () => {
      renderDashboard();
      expect(screen.queryByTestId("tab-finchWorkforce")).not.toBeInTheDocument();
    });

    it("does NOT show Finch Industry tab (Finch-specific)", () => {
      renderDashboard();
      expect(screen.queryByTestId("tab-finchIndustry")).not.toBeInTheDocument();
    });

    it("renders RecommendationsFinchPage inside its panel", () => {
      renderDashboard();
      expect(screen.getByTestId("recommendations-finch-page")).toBeInTheDocument();
    });

    it("renders BenchmarkPage inside the Industry panel", () => {
      renderDashboard();
      expect(screen.getByTestId("benchmark-page")).toBeInTheDocument();
    });

    it("does NOT render WorkforcePage (Finch-specific)", () => {
      renderDashboard();
      expect(screen.queryByTestId("workforce-page")).not.toBeInTheDocument();
    });

    it("does NOT render BenchmarkFinchPage (Finch-specific)", () => {
      renderDashboard();
      expect(screen.queryByTestId("benchmark-finch-page")).not.toBeInTheDocument();
    });

    it("does NOT show Take the assessment card", () => {
      renderDashboard();
      expect(screen.queryByText("Take the assessment")).not.toBeInTheDocument();
    });

    it("does NOT show Finch/Manual entry options", () => {
      renderDashboard();
      expect(screen.queryByText("Start with Finch")).not.toBeInTheDocument();
      expect(screen.queryByText("Let's get started")).not.toBeInTheDocument();
    });
  });

  // ── Verified — Finch Connected ───────────────────────────────────────────────
  describe("Verified email, Finch connected", () => {
    beforeEach(() => {
      mockUseFinchStatus.mockReturnValue({
        ...DEFAULT_FINCH_STATUS,
        isConnected: true,
        connectionStatus: "connected",
      });
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 4,
        assessmentData: {
          data: { status: "completed", sections: {} },
          assessmentType: "finch",
        },
        isFinchCompleted: true,
        isFinchAssessmentIncomplete: false,
      });
    });

    it("shows Hi, FirstName! greeting", () => {
      renderDashboard();
      expect(screen.getByText(/Hi, Jane!/i)).toBeInTheDocument();
    });

    it("shows Finch overview paragraph", () => {
      renderDashboard();
      expect(
        screen.getByText(/Here's an overview of your workforce, industry/i)
      ).toBeInTheDocument();
    });

    it("shows Recommendations tab", () => {
      renderDashboard();
      expect(screen.getByTestId("tab-finchRecommendations")).toBeInTheDocument();
    });

    it("shows Workforce tab (Finch-specific)", () => {
      renderDashboard();
      expect(screen.getByTestId("tab-finchWorkforce")).toBeInTheDocument();
      expect(screen.getByText("Workforce")).toBeInTheDocument();
    });

    it("shows Finch Industry tab (Finch-specific)", () => {
      renderDashboard();
      expect(screen.getByTestId("tab-finchIndustry")).toBeInTheDocument();
    });

    it("does NOT show the manual Industry tab", () => {
      renderDashboard();
      expect(screen.queryByTestId("tab-industry")).not.toBeInTheDocument();
    });

    it("renders WorkforcePage inside its panel", () => {
      renderDashboard();
      expect(screen.getByTestId("workforce-page")).toBeInTheDocument();
    });

    it("renders BenchmarkFinchPage inside the Finch Industry panel", () => {
      renderDashboard();
      expect(screen.getByTestId("benchmark-finch-page")).toBeInTheDocument();
    });

    it("renders RecommendationsFinchPage inside its panel", () => {
      renderDashboard();
      expect(screen.getByTestId("recommendations-finch-page")).toBeInTheDocument();
    });

    it("does NOT show Finch/Manual entry options when connected", () => {
      renderDashboard();
      expect(screen.queryByText("Start with Finch")).not.toBeInTheDocument();
      expect(screen.queryByText("Let's get started")).not.toBeInTheDocument();
    });
  });

  // ── Verified — Finch Connected + Assessment Incomplete ───────────────────────
  describe("Verified email, Finch connected but assessment incomplete", () => {
    beforeEach(() => {
      mockUseFinchStatus.mockReturnValue({
        ...DEFAULT_FINCH_STATUS,
        isConnected: true,
        connectionStatus: "connected",
      });
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 1,
        isFinchCompleted: false,
        isFinchAssessmentIncomplete: true,
        assessmentData: {
          data: { status: "in_progress", sections: {} },
          assessmentType: "finch",
        },
      });
    });

    it("shows Complete your assessment DashboardCard (for Finch flow)", () => {
      renderDashboard();
      // The card has a title "Complete your assessment" and a Continue button
      const headings = screen.getAllByText(/Complete your assessment/i);
      expect(headings.length).toBeGreaterThan(0);
    });

    it("shows Continue button for additional questions", () => {
      renderDashboard();
      const continueButtons = screen.getAllByText("Continue");
      expect(continueButtons.length).toBeGreaterThan(0);
    });

    it("clicking the Finch Continue button navigates to /additional-questions", () => {
      renderDashboard();
      // The bottom DashboardCard (isConnected && !isFinchCompleted) has onClick → /additional-questions
      // It appears after the tab area. Find buttons labelled "Continue" and click each.
      const continueButtons = screen.getAllByText("Continue");
      continueButtons.forEach(btn => fireEvent.click(btn));
      expect(mockNavigate).toHaveBeenCalledWith("/additional-questions");
    });
  });

  // ── Tab Switching ────────────────────────────────────────────────────────────
  describe("Tab switching (Finch connected)", () => {
    beforeEach(() => {
      mockUseFinchStatus.mockReturnValue({
        ...DEFAULT_FINCH_STATUS,
        isConnected: true,
        connectionStatus: "connected",
      });
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 4,
        assessmentData: {
          data: { status: "completed", sections: {} },
          assessmentType: "finch",
        },
        isFinchCompleted: true,
      });
    });

    it("active tab defaults to finchRecommendations", () => {
      renderDashboard();
      expect(screen.getByTestId("tabs")).toHaveAttribute(
        "data-selected-key",
        "finchRecommendations"
      );
    });

    it("clicking Workforce tab updates selected key to finchWorkforce", async () => {
      renderDashboard();
      fireEvent.click(screen.getByTestId("tab-finchWorkforce"));
      await waitFor(() => {
        expect(screen.getByTestId("tabs")).toHaveAttribute("data-selected-key", "finchWorkforce");
      });
    });

    it("clicking Industry tab updates selected key to finchIndustry", async () => {
      renderDashboard();
      fireEvent.click(screen.getByTestId("tab-finchIndustry"));
      await waitFor(() => {
        expect(screen.getByTestId("tabs")).toHaveAttribute("data-selected-key", "finchIndustry");
      });
    });
  });

  // ── Tab Switching (manual / non-Finch) ──────────────────────────────────────
  describe("Tab switching (manual assessment completed)", () => {
    beforeEach(() => {
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 4,
        assessmentData: { ...COMPLETED_ASSESSMENT },
        isFinchCompleted: false,
      });
    });

    it("clicking Industry tab updates selected key to industry", async () => {
      renderDashboard();
      fireEvent.click(screen.getByTestId("tab-industry"));
      await waitFor(() => {
        expect(screen.getByTestId("tabs")).toHaveAttribute("data-selected-key", "industry");
      });
    });
  });

  // ── Finch Error Display ──────────────────────────────────────────────────────
  describe("Finch error display", () => {
    it("shows ErrorMessage component when useFinchConnect returns an error", () => {
      mockUseFinchConnect.mockReturnValue({
        ...DEFAULT_FINCH_CONNECT,
        error: "Finch connection failed",
      });
      renderDashboard();
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByText("Finch connection failed")).toBeInTheDocument();
    });

    it("calls clearFinchError when the error close button is clicked", () => {
      mockUseFinchConnect.mockReturnValue({
        ...DEFAULT_FINCH_CONNECT,
        error: "Finch connection failed",
      });
      renderDashboard();
      fireEvent.click(screen.getByTestId("error-close-btn"));
      expect(mockClearFinchError).toHaveBeenCalledTimes(1);
    });

    it("does NOT show error message when Finch error is null", () => {
      renderDashboard();
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });
  });

  // ── Modals (BaseModalWithIcon) ───────────────────────────────────────────────
  describe("Modals", () => {
    it("resend success modal is closed by default (BaseModalWithIcon not in DOM)", () => {
      renderDashboard();
      // isOpen defaults to false for all modals — BaseModalWithIcon renders null
      expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument();
    });
  });

  // ── isDashboardVisible conditional ──────────────────────────────────────────
  describe("isDashboardVisible", () => {
    it("is false when assessment not completed AND not connected — tabs not shown", () => {
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        assessmentData: { data: { status: "in_progress", sections: {} }, assessmentType: "manual" },
      });
      renderDashboard();
      expect(screen.queryByTestId("tabs")).not.toBeInTheDocument();
    });

    it("is true when isConnected even without completed assessment — tabs shown", () => {
      mockUseFinchStatus.mockReturnValue({
        ...DEFAULT_FINCH_STATUS,
        isConnected: true,
        connectionStatus: "connected",
      });
      renderDashboard();
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    it("is true when assessment status is completed — tabs shown", () => {
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        completionCount: 4,
        assessmentData: { ...COMPLETED_ASSESSMENT },
      });
      renderDashboard();
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
  });

  // ── isFinchAssessmentIncomplete welcome message ──────────────────────────────
  describe("isFinchAssessmentIncomplete flag", () => {
    it("uses Hi greeting when isFinchAssessmentIncomplete is true", () => {
      mockUseAssessmentStatus.mockReturnValue({
        ...DEFAULT_ASSESSMENT_STATUS,
        isFinchAssessmentIncomplete: true,
      });
      renderDashboard();
      expect(screen.getByText(/Hi, Jane!/i)).toBeInTheDocument();
    });

    it("uses Welcome greeting when isFinchAssessmentIncomplete is false and status not completed", () => {
      renderDashboard();
      expect(screen.getByText("Welcome, Jane!")).toBeInTheDocument();
    });
  });

  // ── SessionStorage — goalsCompletionPending ──────────────────────────────────
  describe("SessionStorage goalsCompletionPending", () => {
    it("reads and removes goalsCompletionPending from sessionStorage on mount", () => {
      sessionStorage.setItem("goalsCompletionPending", "true");
      const getSpy = vi.spyOn(Storage.prototype, "getItem");
      const removeSpy = vi.spyOn(Storage.prototype, "removeItem");
      renderDashboard();
      expect(getSpy).toHaveBeenCalledWith("goalsCompletionPending");
      expect(removeSpy).toHaveBeenCalledWith("goalsCompletionPending");
      getSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  // ── Event Listeners (visibility / focus) ────────────────────────────────────
  describe("Event listener cleanup", () => {
    it("adds and removes visibilitychange and focus listeners", () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const { unmount } = renderDashboard();
      expect(addSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  // ── User with missing firstName ──────────────────────────────────────────────
  describe("User firstName edge cases", () => {
    it("renders without crashing when user firstName is undefined", () => {
      renderDashboard({ firstName: undefined });
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
  });
});
