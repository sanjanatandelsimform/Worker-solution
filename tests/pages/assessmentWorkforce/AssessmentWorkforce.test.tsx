import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AssessmentWorkforcePage from "@/pages/assessmentWorkforce/AssessmentWorkforce";

const mockNavigate = vi.fn();
const mockUseAssessmentStatus = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock("@/store/selectors/authSelectors", () => ({
  selectUser: {},
}));

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: () => mockUseAssessmentStatus(),
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children || "icon-btn"}</button>
  ),
}));

vi.mock("@untitledui/icons", () => ({
  ChevronLeft: () => <span>left</span>,
  ChevronRight: () => <span>right</span>,
  XClose: () => <span>close</span>,
}));

vi.mock("@/components/common/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="spinner">loading</div>,
}));

vi.mock("@/pages/assessmentWorkforce/ProgressStepper", () => ({
  ProgressStepper: ({ onStepChange }: { onStepChange: (stepId: string) => void }) => (
    <div>
      <button onClick={() => onStepChange("workforce")}>to-workforce</button>
      <button onClick={() => onStepChange("benefits")}>to-benefits</button>
    </div>
  ),
}));

vi.mock("@/pages/assessmentWorkforce/WorkforceTab", () => ({
  default: () => <div>workforce-tab</div>,
}));
vi.mock("@/pages/assessmentWorkforce/CompensationTab", () => ({
  default: () => <div>compensation-tab</div>,
}));
vi.mock("@/pages/assessmentWorkforce/BenefitsTab", () => ({
  default: () => <div>benefits-tab</div>,
}));
vi.mock("@/pages/assessmentWorkforce/GoalsTab", () => ({
  default: () => <div>goals-tab</div>,
}));

describe("AssessmentWorkforcePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue({ emailVerify: true });
    mockUseAssessmentStatus.mockReturnValue({
      completionCount: 0,
      assessmentData: { data: { status: "in_progress" } },
      isLoading: false,
      sectionCompletion: { workforce: true, compensation: false, benefits: false, goals: false },
      refetch: vi.fn().mockResolvedValue(undefined),
    });
    (window as typeof window & { __dynamicTabValidation?: unknown }).__dynamicTabValidation = {
      submit: vi.fn().mockResolvedValue({ success: true }),
      clearErrors: vi.fn(),
    };
  });

  it("renders spinner while loading", () => {
    mockUseAssessmentStatus.mockReturnValue({
      completionCount: 0,
      assessmentData: null,
      isLoading: true,
      sectionCompletion: null,
      refetch: vi.fn(),
    });
    render(<AssessmentWorkforcePage />);
    expect(screen.getByTestId("spinner")).toBeTruthy();
  });

  it("redirects to dashboard for unverified user", async () => {
    mockUseAppSelector.mockReturnValue({ emailVerify: false });
    render(<AssessmentWorkforcePage />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("handles next/back/close actions", async () => {
    render(<AssessmentWorkforcePage />);
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByText("compensation-tab")).toBeTruthy());

    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByText("workforce-tab")).toBeTruthy();

    fireEvent.click(screen.getByText("icon-btn"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
