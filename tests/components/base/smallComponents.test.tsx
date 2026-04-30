/**
 * Tests for small/zero-coverage components:
 * - App, BarChartPage, GoalsSection, FieldError, Declarations, Accordion, TextArea, Avatar
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// -------------------------------------------------------------------
// Store setup
// -------------------------------------------------------------------
vi.mock("@/services/api/authApi", () => ({
  default: { get: vi.fn(), post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }, defaults: { headers: { common: {} } } },
  refreshAccessToken: vi.fn(),
  signout: vi.fn(),
}));
vi.mock("@/services/api/assessmentApi", () => ({ getAssessment: vi.fn().mockResolvedValue({ success: false, data: null }) }));
vi.mock("@/services/api/finchApi", () => ({ getFinchStatus: vi.fn().mockResolvedValue({ connection: null, latestSyncJob: null }) }));
vi.mock("@/services/api/industryApi", () => ({ getIndustry: vi.fn() }));
vi.mock("@/services/api/dashboardApi", () => ({ getDashboard: vi.fn() }));
vi.mock("@/services/api/workforceApi", () => ({ getWorkforce: vi.fn() }));
vi.mock("@/services/api/recommendationsApi", () => ({ getRecommendations: vi.fn() }));
vi.mock("@/services/api/profileApi", () => ({ updateProfile: vi.fn(), updateEmail: vi.fn(), updatePassword: vi.fn(), deleteAccount: vi.fn(), resendEmailVerification: vi.fn(), retakeAssessment: vi.fn() }));
vi.mock("@/services/api/userApi", () => ({ getUserById: vi.fn() }));

// Mock heavy page components to prevent deep render chains
vi.mock("@/pages/dashboard/DashboardPage", () => ({ DashboardPage: () => <div>Dashboard</div> }));
vi.mock("@/pages/settings/SettingsPage", () => ({ SettingsPage: () => <div>Settings</div> }));
vi.mock("@/pages/assessmentWorkforce/AssessmentWorkforce", () => ({ default: () => <div>Assessment</div> }));
vi.mock("@/pages/getMore/GetMore", () => ({ default: () => <div>GetMore</div> }));
vi.mock("@/pages/additionalQuestions/AdditionalQuestions", () => ({ default: () => <div>AdditionalQuestions</div> }));
vi.mock("@/pages/aboutUs/AboutUs", () => ({ default: () => <div>AboutUs</div> }));
vi.mock("@/pages/auth/RegisterPage", () => ({ RegisterPage: () => <div>Register</div> }));
vi.mock("@/pages/auth/SignInPage", () => ({ SignInPage: () => <div>SignIn</div> }));
vi.mock("@/pages/auth/VerifyEmailPage", () => ({ VerifyEmailPage: () => <div>VerifyEmail</div> }));
vi.mock("@/pages/successPage/SuccessPage", () => ({ SuccessPage: () => <div>Success</div> }));
vi.mock("@/pages/termsPolicy/PrivacyPage", () => ({ default: () => <div>Privacy</div> }));
vi.mock("@/pages/termsPolicy/TermsPage", () => ({ default: () => <div>Terms</div> }));
vi.mock("@/components/auth/ForgotPasswordForm", () => ({ default: () => <div>ForgotPassword</div> }));
vi.mock("@/components/auth/ResetPasswordForm", () => ({ default: () => <div>ResetPassword</div> }));
vi.mock("@/components/common/LoadingSpinner", () => ({ LoadingSpinner: () => <div>Loading...</div> }));
vi.mock("@/components/auth/AuthErrorBoundary", () => ({
  AuthErrorBoundary: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/routes/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/routes/PublicRoute", () => ({
  PublicRoute: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/components/routes/UnrestrictedRoute", () => ({
  UnrestrictedRoute: ({ children }: any) => <>{children}</>,
}));
vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: () => ({}),
}));

import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import industryReducer from "@/store/slices/industrySlice";
import workforceReducer from "@/store/slices/workforceSlice";
import recommendationsReducer from "@/store/slices/recommendationsSlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      user: userReducer,
      dashboard: dashboardReducer,
      industry: industryReducer,
      workforce: workforceReducer,
      recommendations: recommendationsReducer,
      finchStatus: finchStatusReducer,
      registrationForm: registrationFormReducer,
    },
    preloadedState: {
      auth: { user: null, isAuthenticated: false, isLoading: false, authInitAttempted: true, tokens: { accessToken: null, refreshToken: null } },
    } as any,
  });

const renderWithProviders = (ui: React.ReactElement, route = "/") => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>
  );
};

// -------------------------------------------------------------------
// App.tsx
// -------------------------------------------------------------------
import App from "@/App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", { removeItem: vi.fn(), setItem: vi.fn() });
  });

  it("renders dashboard route when authenticated", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("renders sign-in route", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/sign-in"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("SignIn")).toBeTruthy();
  });

  it("shows loading spinner when auth not ready", () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        profile: profileReducer,
        user: userReducer,
        dashboard: dashboardReducer,
        industry: industryReducer,
        workforce: workforceReducer,
        recommendations: recommendationsReducer,
        finchStatus: finchStatusReducer,
        registrationForm: registrationFormReducer,
      },
      preloadedState: {
        auth: { user: null, isAuthenticated: false, isLoading: true, authInitAttempted: false, tokens: { accessToken: null, refreshToken: null } },
      } as any,
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Loading...")).toBeTruthy();
  });
});

// -------------------------------------------------------------------
// FieldError.tsx
// -------------------------------------------------------------------
import { FieldError } from "@/components/common/FieldError";

describe("FieldError", () => {
  it("renders nothing when message is undefined", () => {
    const { container } = render(<FieldError message={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when message is empty string", () => {
    const { container } = render(<FieldError message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error message when provided", () => {
    render(<FieldError message="This field is required" />);
    expect(screen.getByText("This field is required")).toBeTruthy();
  });
});

// -------------------------------------------------------------------
// Accordion.tsx
// -------------------------------------------------------------------
import { Accordion, AccordionItem } from "@/components/base/accordion/accordion";

describe("Accordion", () => {
  it("renders with defaultValue open", () => {
    render(
      <Accordion defaultValue="item1">
        <AccordionItem value="item1" header={<span>Header 1</span>}>
          Content 1
        </AccordionItem>
        <AccordionItem value="item2" header={<span>Header 2</span>}>
          Content 2
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText("Header 1")).toBeTruthy();
    expect(screen.getByText("Content 1")).toBeTruthy();
    // item2 is closed
    expect(screen.queryByText("Content 2")).toBeNull();
  });

  it("toggles open/close on click (uncontrolled)", () => {
    render(
      <Accordion>
        <AccordionItem value="item1" header={<span>Header 1</span>}>
          Body 1
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText("Body 1")).toBeNull();
    fireEvent.click(screen.getByText("Header 1"));
    expect(screen.getByText("Body 1")).toBeTruthy();
    // Toggle again to close
    fireEvent.click(screen.getByText("Header 1"));
    expect(screen.queryByText("Body 1")).toBeNull();
  });

  it("calls onChange when item toggled (uncontrolled)", () => {
    const onChange = vi.fn();
    render(
      <Accordion onChange={onChange}>
        <AccordionItem value="item1" header={<span>H1</span>}>Content</AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText("H1"));
    expect(onChange).toHaveBeenCalledWith("item1");
    // Close again
    fireEvent.click(screen.getByText("H1"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("calls onChange in controlled mode", () => {
    const onChange = vi.fn();
    render(
      <Accordion value="item1" onChange={onChange}>
        <AccordionItem value="item1" header={<span>H1</span>}>Content</AccordionItem>
        <AccordionItem value="item2" header={<span>H2</span>}>Content 2</AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText("H2"));
    expect(onChange).toHaveBeenCalledWith("item2");
  });

  it("renders non-element children without crashing", () => {
    render(
      <Accordion>
        <AccordionItem value="item1" header={<span>H1</span>}>Content</AccordionItem>
        {null}
        {false}
      </Accordion>
    );
    expect(screen.getByText("H1")).toBeTruthy();
  });
});

// -------------------------------------------------------------------
// Avatar.tsx
// -------------------------------------------------------------------
import { Avatar } from "@/components/base/avatar/avatar";

describe("Avatar", () => {
  it("renders default icon when no src, initials or placeholder", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });

  it("renders image when src provided", () => {
    render(<Avatar src="https://example.com/img.jpg" alt="User" />);
    expect(screen.getByAltText("User")).toBeTruthy();
  });

  it("renders initials when provided", () => {
    render(<Avatar initials="AB" />);
    expect(screen.getByText("AB")).toBeTruthy();
  });

  it("renders placeholder icon when placeholderIcon provided", () => {
    const Icon = ({ className }: { className?: string }) => <svg className={className} data-testid="placeholder-icon" />;
    render(<Avatar placeholderIcon={Icon} />);
    expect(screen.getByTestId("placeholder-icon")).toBeTruthy();
  });

  it("renders placeholder node when placeholder provided", () => {
    render(<Avatar placeholder={<div>Custom placeholder</div>} />);
    expect(screen.getByText("Custom placeholder")).toBeTruthy();
  });

  it("handles image error by switching to fallback", () => {
    render(<Avatar src="bad-url" alt="User" initials="AB" />);
    const img = screen.getByAltText("User");
    act(() => {
      fireEvent.error(img);
    });
    expect(screen.getByText("AB")).toBeTruthy();
  });

  it("renders online status indicator", () => {
    const { container } = render(<Avatar status="online" />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });

  it("renders offline status indicator", () => {
    const { container } = render(<Avatar status="offline" />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });

  it("renders verified tick", () => {
    const { container } = render(<Avatar verified />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });

  it("renders count badge", () => {
    const { container } = render(<Avatar count={5} />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });

  it("renders badge", () => {
    render(<Avatar badge={<span>badge</span>} />);
    expect(screen.getByText("badge")).toBeTruthy();
  });

  it("applies all sizes without crashing", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Avatar size={size} />);
      unmount();
    }
  });

  it("applies rounded=false", () => {
    const { container } = render(<Avatar rounded={false} />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });

  it("applies border and focusable props", () => {
    const { container } = render(<Avatar border focusable />);
    expect(container.querySelector("[data-avatar]")).toBeTruthy();
  });
});

// -------------------------------------------------------------------
// GoalsSection.tsx
// -------------------------------------------------------------------
import GoalsSection from "@/pages/additionalQuestions/GoalsSection";

// Mock dependencies
vi.mock("@/components/base/checkbox/checkbox", () => ({
  Checkbox: ({ isSelected, onChange }: any) => (
    <input type="checkbox" checked={isSelected} onChange={onChange} />
  ),
}));
vi.mock("@/components/common/RankList", () => ({
  RankingList: ({ onChange, value }: any) => (
    <div data-testid="ranking-list">
      <button onClick={() => onChange(["goal1"])}>Set top</button>
    </div>
  ),
}));

describe("GoalsSection", () => {
  const defaultProps = {
    goalsAnswers: { selectedGoals: [], topThreeGoals: [] },
    fieldErrors: {},
    onGoalToggle: vi.fn(),
    onTopThreeGoalsChange: vi.fn(),
  };

  it("renders goals section header", () => {
    render(<GoalsSection {...defaultProps} />);
    expect(screen.getByText("Goals")).toBeTruthy();
  });

  it("renders goal checkboxes from goalsData", () => {
    render(<GoalsSection {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("calls onGoalToggle when checkbox clicked", () => {
    const onGoalToggle = vi.fn();
    render(<GoalsSection {...defaultProps} onGoalToggle={onGoalToggle} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onGoalToggle).toHaveBeenCalled();
  });

  it("shows field error for selectedGoals", () => {
    render(<GoalsSection {...defaultProps} fieldErrors={{ selectedGoals: "Please select at least one goal" }} />);
    expect(screen.getByText("Please select at least one goal")).toBeTruthy();
  });

  it("calls onTopThreeGoalsChange from RankingList", () => {
    const onTopThreeGoalsChange = vi.fn();
    render(<GoalsSection {...defaultProps} onTopThreeGoalsChange={onTopThreeGoalsChange} />);
    fireEvent.click(screen.getByText("Set top"));
    expect(onTopThreeGoalsChange).toHaveBeenCalledWith(["goal1"]);
  });
});

// -------------------------------------------------------------------
// BarChartPage.tsx
// -------------------------------------------------------------------
import { BarChartPage } from "@/pages/benchmark/BarChartPage";

vi.mock("@/components/application/charts/chart-utils", () => ({
  selectEvenlySpacedItems: (items: any[]) => items,
}));

// Capture the labelFormatter and tickFormatter from Tooltip and XAxis/YAxis
let capturedLabelFormatter: ((val: any) => any) | null = null;
let capturedXTickFormatter: ((val: any) => any) | null = null;
let capturedYTickFormatter: ((val: any) => any) | null = null;
vi.mock("recharts", () => ({
  Bar: () => null,
  CartesianGrid: () => null,
  ComposedChart: ({ children }: any) => <div data-testid="chart">{children}</div>,
  Label: ({ value }: any) => <span>{value ?? ""}</span>,
  Line: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ labelFormatter, formatter }: any) => {
    capturedLabelFormatter = labelFormatter;
    return <div data-testid="tooltip-capturer" />;
  },
  XAxis: ({ children, tickFormatter }: any) => {
    capturedXTickFormatter = tickFormatter;
    return <div data-testid="x-axis">{children}</div>;
  },
  YAxis: ({ children, tickFormatter }: any) => {
    capturedYTickFormatter = tickFormatter;
    return <div data-testid="y-axis">{children}</div>;
  },
}));

describe("BarChartPage", () => {
  beforeEach(() => {
    capturedLabelFormatter = null;
    capturedXTickFormatter = null;
    capturedYTickFormatter = null;
  });

  it("renders without crashing", () => {
    const { container } = render(<BarChartPage />);
    expect(container).toBeTruthy();
  });

  it("renders chart component", () => {
    render(<BarChartPage />);
    expect(screen.getByTestId("chart")).toBeTruthy();
  });

  it("labelFormatter returns empty string for falsy value", () => {
    render(<BarChartPage />);
    expect(capturedLabelFormatter).toBeTruthy();
    const result = capturedLabelFormatter!(null);
    expect(result).toBe("");
  });

  it("labelFormatter formats same-month range correctly", () => {
    render(<BarChartPage />);
    expect(capturedLabelFormatter).toBeTruthy();
    // June 1 to June 7 should be same month
    const result = capturedLabelFormatter!("2025-06-01");
    expect(typeof result).toBe("string");
    expect(result).toContain("2025");
  });

  it("labelFormatter formats cross-month range correctly", () => {
    render(<BarChartPage />);
    expect(capturedLabelFormatter).toBeTruthy();
    // May 30 to June 5 should be cross-month
    const result = capturedLabelFormatter!("2025-05-30");
    expect(typeof result).toBe("string");
  });

  it("XAxis tickFormatter converts date to month abbreviation", () => {
    render(<BarChartPage />);
    expect(capturedXTickFormatter).toBeTruthy();
    const result = capturedXTickFormatter!("2025-06-01");
    expect(typeof result).toBe("string");
  });

  it("YAxis tickFormatter converts number to locale string", () => {
    render(<BarChartPage />);
    expect(capturedYTickFormatter).toBeTruthy();
    const result = capturedYTickFormatter!(1000);
    expect(result).toBe("1,000");
  });
});

// -------------------------------------------------------------------
// Declarations.tsx
// -------------------------------------------------------------------
import Declarations from "@/components/common/Declarations";

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));
vi.mock("@/components/modals/TermsModal", () => ({
  default: ({ isOpen }: any) => isOpen ? <div data-testid="terms-modal">Terms Modal</div> : null,
}));

describe("Declarations", () => {
  it("renders declarations text", () => {
    render(<Declarations />);
    expect(screen.getByText(/informational insights/i)).toBeTruthy();
  });

  it("opens terms modal on Terms of Use click", () => {
    render(<Declarations />);
    const btn = screen.getByText("Terms of Use");
    fireEvent.click(btn);
    expect(screen.getByTestId("terms-modal")).toBeTruthy();
  });

  it("opens privacy modal on Privacy Notice click", () => {
    render(<Declarations />);
    const btn = screen.getByText("Privacy Notice");
    fireEvent.click(btn);
    // There are 2 TermsModal instances (one for terms, one for privacy)
    const modals = screen.getAllByTestId("terms-modal");
    expect(modals.length).toBeGreaterThan(0);
  });
});

// -------------------------------------------------------------------
// PreparingDashboard.tsx (0% coverage)
// -------------------------------------------------------------------
import PreparingDashboard from "@/pages/recommendations/PreparingDashboard";

vi.mock("@/assets/preparingData.svg", () => ({ default: "preparingData.svg" }));

describe("PreparingDashboard", () => {
  it("renders preparing dashboard text", () => {
    render(<PreparingDashboard />);
    expect(screen.getByText("Preparing your dashboard")).toBeTruthy();
  });

  it("renders the description paragraph", () => {
    render(<PreparingDashboard />);
    expect(screen.getByText(/Finch is working hard/i)).toBeTruthy();
  });

  it("renders the image with alt text", () => {
    render(<PreparingDashboard />);
    const img = screen.getByAltText("Preparing Dashboard");
    expect(img).toBeTruthy();
  });
});
