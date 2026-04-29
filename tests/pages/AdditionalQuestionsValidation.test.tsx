/**
 * Tests for AdditionalQuestions page — validation, submission, and state interactions.
 *
 * Covers:
 *   US2 – Full form validation (all required fields, conditional checks)
 *   US3 – Field interaction and inline error clearing
 *   US4 – Submission payload construction
 *   US5 – Error and success message display
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";
import { buildFinchAssessmentPayload } from "@/utils/finchAssessmentPayload";

// ── Global mocks ───────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: vi.fn(() => ({
    isFinchCompleted: false,
    completionCount: 0,
    isLoading: false,
    error: null,
    assessmentData: { assessmentType: "finch", data: { status: "in_progress" } },
    sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
    refetch: vi.fn(),
  })),
}));

const mockSubmit = vi.fn();
const mockClearError = vi.fn();

vi.mock("@/hooks/useSubmitFinchAssessment", () => ({
  useSubmitFinchAssessment: vi.fn(() => ({
    isSubmitting: false,
    error: null,
    success: false,
    submit: mockSubmit,
    clearError: mockClearError,
  })),
}));

vi.mock("@/utils/finchAssessmentPayload", () => ({
  buildFinchAssessmentPayload: vi.fn(() => ({
    workforce: {},
    compensation: {},
    benefits: {},
    goals: {},
  })),
}));

vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({
    errorMessage,
    onClose,
    errorType,
  }: {
    errorMessage: string;
    onClose?: () => void;
    errorType?: string;
  }) => (
    <div data-testid="error-message" data-type={errorType}>
      {errorMessage}
      {onClose && (
        <button data-testid="error-close" onClick={onClose}>
          close
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({
    children,
    onClick,
    isDisabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  ),
}));

// ── goalsData mock ────────────────────────────────────────────────────────

vi.mock("@/data/goalsData", () => ({
  goalsData: [
    {
      category: "Test",
      goals: [
        { id: "goal1", label: "Goal 1" },
        { id: "goal2", label: "Goal 2" },
        { id: "goal3", label: "Goal 3" },
      ],
    },
  ],
}));

// ── Section component stubs ───────────────────────────────────────────────

vi.mock("@/pages/additionalQuestions/WorkforceSection", () => ({
  default: ({
    fieldErrors,
    onAnswerChange,
    onMultiSelectToggle,
  }: {
    answers: Record<string, string | string[]>;
    fieldErrors: Record<string, string>;
    onAnswerChange: (id: string, v: string) => void;
    onMultiSelectToggle: (id: string, optId: string) => void;
  }) => (
    <div data-testid="workforce-section">
      {Object.entries(fieldErrors)
        .filter(([k]) => ["benefits-updates", "deskless-employees", "annual-raises"].includes(k))
        .map(([k, v]) =>
          v ? (
            <span key={k} data-testid={`field-error-${k}`}>
              {v}
            </span>
          ) : null
        )}
      <button
        data-testid="trigger-benefits-updates-work_email"
        onClick={() => onMultiSelectToggle("benefits-updates", "work_email")}
      >
        set benefits-updates
      </button>
      <button
        data-testid="trigger-deskless-employees-yes-deskless"
        onClick={() => onAnswerChange("deskless-employees", "yes-deskless")}
      >
        set deskless
      </button>
      <button
        data-testid="trigger-annual-raises-yes-raises"
        onClick={() => onAnswerChange("annual-raises", "yes-raises")}
      >
        set annual-raises yes
      </button>
      <button
        data-testid="trigger-annual-raises-no-raises"
        onClick={() => onAnswerChange("annual-raises", "no-raises")}
      >
        set annual-raises no
      </button>
    </div>
  ),
}));

vi.mock("@/pages/additionalQuestions/CompensationSection", () => ({
  default: ({
    fieldErrors,
    onAnswerChange,
    onPayrollProviderChange,
    onAnnualRaiseMonthChange,
  }: {
    answers: Record<string, string | string[]>;
    fieldErrors: Record<string, string>;
    annualRaiseMonth: string;
    payrollProvider: string;
    onAnswerChange: (id: string, v: string) => void;
    onMultiSelectToggle: (id: string, optId: string) => void;
    onAnnualRaiseMonthChange: (month: string) => void;
    onPayrollProviderChange: (provider: string) => void;
    onClearFieldError: (key: string) => void;
  }) => (
    <div data-testid="compensation-section">
      {Object.entries(fieldErrors)
        .filter(([k]) => ["payroll-provider", "annualRaiseMonth"].includes(k))
        .map(([k, v]) =>
          v ? (
            <span key={k} data-testid={`field-error-${k}`}>
              {v}
            </span>
          ) : null
        )}
      <button
        data-testid="trigger-payroll-provider-ADP"
        onClick={() => onPayrollProviderChange("ADP")}
      >
        set payroll provider
      </button>
      <button
        data-testid="trigger-annual-raise-month-january"
        onClick={() => onAnnualRaiseMonthChange("january")}
      >
        set raise month
      </button>
    </div>
  ),
}));

vi.mock("@/pages/additionalQuestions/BenefitsRetirementSection", () => ({
  default: ({
    fieldErrors,
    onAnswerChange,
    onBenefitsEnrollmentMonthChange,
    onHealthPremiumMonthlyChange,
    onRetirementMatchPercentageChange,
    onClearFieldError,
  }: {
    answers: Record<string, string | string[]>;
    fieldErrors: Record<string, string>;
    benefitsEnrollmentMonth: string;
    retirementMatchPercentage: string;
    healthPremiumMonthly: string;
    onAnswerChange: (id: string, v: string) => void;
    onBenefitsEnrollmentMonthChange: (month: string) => void;
    onRetirementMatchPercentageChange: (value: string) => void;
    onHealthPremiumMonthlyChange: (value: string) => void;
    onClearFieldError: (key: string) => void;
  }) => (
    <div data-testid="benefits-section">
      {Object.entries(fieldErrors)
        .filter(([k]) =>
          [
            "benefits-broker",
            "benefits-enrollment-period",
            "health-plan-monthly-premium",
            "retirement-vesting-period",
            "retirement-employer-match",
            "retirementMatchPercentage",
            "retirement-auto-enroll",
            "retirement-hardship-withdrawals",
          ].includes(k)
        )
        .map(([k, v]) =>
          v ? (
            <span key={k} data-testid={`field-error-${k}`}>
              {v}
            </span>
          ) : null
        )}
      <button
        data-testid="trigger-benefits-broker-yes-broker"
        onClick={() => onAnswerChange("benefits-broker", "yes-broker")}
      >
        set benefits broker
      </button>
      <button
        data-testid="trigger-benefits-enrollment-month-january"
        onClick={() => onBenefitsEnrollmentMonthChange("january")}
      >
        set benefits enrollment month
      </button>
      <button
        data-testid="trigger-health-premium-monthly-300"
        onClick={() => {
          onHealthPremiumMonthlyChange("300");
          onClearFieldError("health-plan-monthly-premium");
        }}
      >
        set health premium
      </button>
      <button
        data-testid="trigger-retirement-vesting-period-6mo_or_less"
        onClick={() => onAnswerChange("retirement-vesting-period", "6mo_or_less")}
      >
        set vesting period
      </button>
      <button
        data-testid="trigger-retirement-employer-match-yes-match"
        onClick={() => onAnswerChange("retirement-employer-match", "yes-match")}
      >
        set employer match yes
      </button>
      <button
        data-testid="trigger-retirement-employer-match-no-match"
        onClick={() => onAnswerChange("retirement-employer-match", "no-match")}
      >
        set employer match no
      </button>
      <button
        data-testid="trigger-retirement-auto-enroll-yes-autoenroll"
        onClick={() => onAnswerChange("retirement-auto-enroll", "yes-autoenroll")}
      >
        set auto enroll
      </button>
      <button
        data-testid="trigger-retirement-hardship-withdrawals-yes-hardship"
        onClick={() => onAnswerChange("retirement-hardship-withdrawals", "yes-hardship")}
      >
        set hardship withdrawals
      </button>
      <button
        data-testid="trigger-retirement-match-percentage-5"
        onClick={() => onRetirementMatchPercentageChange("5")}
      >
        set match %5
      </button>
      <button
        data-testid="trigger-retirement-match-percentage-101"
        onClick={() => onRetirementMatchPercentageChange("101")}
      >
        set match %101
      </button>
    </div>
  ),
}));

vi.mock("@/pages/additionalQuestions/GoalsSection", () => ({
  default: ({
    goalsAnswers,
    fieldErrors,
    onGoalToggle,
  }: {
    goalsAnswers: { selectedGoals: string[]; topThreeGoals: string[] };
    fieldErrors: Record<string, string>;
    onGoalToggle: (goalId: string) => void;
    onTopThreeGoalsChange: (goals: string[]) => void;
  }) => (
    <div data-testid="goals-section">
      {fieldErrors["selectedGoals"] ? (
        <span data-testid="field-error-selectedGoals">{fieldErrors["selectedGoals"]}</span>
      ) : null}
      <button data-testid="trigger-goal-goal1" onClick={() => onGoalToggle("goal1")}>
        toggle goal1
      </button>
      <button data-testid="trigger-goal-goal2" onClick={() => onGoalToggle("goal2")}>
        toggle goal2
      </button>
      <button data-testid="trigger-goal-goal3" onClick={() => onGoalToggle("goal3")}>
        toggle goal3
      </button>
      <span data-testid="selected-count">{goalsAnswers.selectedGoals.length}</span>
    </div>
  ),
}));

// ── Import page after all mocks ────────────────────────────────────────────

const { default: AdditionalQuestions } =
  await import("@/pages/additionalQuestions/AdditionalQuestions");

const mockUseSubmitFinchAssessment = vi.mocked(useSubmitFinchAssessment);
const mockBuildPayload = vi.mocked(buildFinchAssessmentPayload);

// ── Helpers ────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdditionalQuestions />
    </MemoryRouter>
  );

const clickNext = () => {
  fireEvent.click(screen.getByRole("button", { name: /next/i }));
};

/** Fill every required field via trigger buttons so validation passes. */
const fillAllRequiredFields = () => {
  // Workforce section
  fireEvent.click(screen.getByTestId("trigger-benefits-updates-work_email"));
  fireEvent.click(screen.getByTestId("trigger-deskless-employees-yes-deskless"));
  fireEvent.click(screen.getByTestId("trigger-annual-raises-no-raises"));
  // Compensation section
  fireEvent.click(screen.getByTestId("trigger-payroll-provider-ADP"));
  // Benefits/retirement section
  fireEvent.click(screen.getByTestId("trigger-benefits-broker-yes-broker"));
  fireEvent.click(screen.getByTestId("trigger-benefits-enrollment-month-january"));
  fireEvent.click(screen.getByTestId("trigger-health-premium-monthly-300"));
  fireEvent.click(screen.getByTestId("trigger-retirement-vesting-period-6mo_or_less"));
  fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-no-match"));
  fireEvent.click(screen.getByTestId("trigger-retirement-auto-enroll-yes-autoenroll"));
  fireEvent.click(screen.getByTestId("trigger-retirement-hardship-withdrawals-yes-hardship"));
  // Goals — toggle 3 goals
  fireEvent.click(screen.getByTestId("trigger-goal-goal1"));
  fireEvent.click(screen.getByTestId("trigger-goal-goal2"));
  fireEvent.click(screen.getByTestId("trigger-goal-goal3"));
};

// ── US2: Form Validation (empty form) ─────────────────────────────────────

describe("AdditionalQuestions – Validation (empty form)", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmit.mockReset();
    mockBuildPayload.mockReturnValue({
      workforce: {},
      compensation: {},
      benefits: {},
      goals: {},
    });
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });
  });

  it("shows goals error when fewer than 3 goals are selected", async () => {
    renderPage();
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-selectedGoals")).toHaveTextContent(
        "Please select at least 3 workforce goals to rank them."
      );
    });
  });

  it("shows all required field errors when form is completely empty", async () => {
    renderPage();
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-benefits-updates")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-deskless-employees")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-annual-raises")).toHaveTextContent("Select an option");
      expect(screen.getByTestId("field-error-payroll-provider")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-benefits-broker")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-benefits-enrollment-period")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-health-plan-monthly-premium")).toHaveTextContent(
        "Enter an amount"
      );
      expect(screen.getByTestId("field-error-retirement-vesting-period")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-retirement-employer-match")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-retirement-auto-enroll")).toHaveTextContent(
        "Select an option"
      );
      expect(screen.getByTestId("field-error-retirement-hardship-withdrawals")).toHaveTextContent(
        "Select an option"
      );
    });
  });

  it("does not call submit() when validation fails on empty form", async () => {
    renderPage();
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-selectedGoals")).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

// ── US2: Conditional validation ────────────────────────────────────────────

describe("AdditionalQuestions – Conditional validation", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmit.mockReset();
    mockBuildPayload.mockReturnValue({
      workforce: {},
      compensation: {},
      benefits: {},
      goals: {},
    });
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });
  });

  it("requires raise month when annual-raises is yes-raises", async () => {
    renderPage();
    fireEvent.click(screen.getByTestId("trigger-annual-raises-yes-raises"));
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-annualRaiseMonth")).toHaveTextContent(
        "Please select a month."
      );
    });
  });

  it("does not require raise month when annual-raises is no-raises", async () => {
    renderPage();
    fireEvent.click(screen.getByTestId("trigger-annual-raises-no-raises"));
    clickNext();
    await waitFor(() => {
      expect(screen.queryByTestId("field-error-annualRaiseMonth")).not.toBeInTheDocument();
    });
  });

  it("requires retirement match percentage when employer-match is yes-match", async () => {
    renderPage();
    fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-yes-match"));
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-retirementMatchPercentage")).toHaveTextContent(
        "Please enter a percentage."
      );
    });
  });

  it("shows percentage-over-100 error when retirement match percentage exceeds 100", async () => {
    renderPage();
    fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-yes-match"));
    fireEvent.click(screen.getByTestId("trigger-retirement-match-percentage-101"));
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-retirementMatchPercentage")).toHaveTextContent(
        "Percentage must be 100 or less."
      );
    });
  });

  it("does not require retirement match percentage when employer-match is no-match", async () => {
    renderPage();
    fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-no-match"));
    clickNext();
    await waitFor(() => {
      expect(screen.queryByTestId("field-error-retirementMatchPercentage")).not.toBeInTheDocument();
    });
  });

  it("passes validation and calls submit when all required fields are filled", async () => {
    renderPage();
    fillAllRequiredFields();
    clickNext();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId("field-error-selectedGoals")).not.toBeInTheDocument();
    expect(screen.queryByTestId("field-error-benefits-updates")).not.toBeInTheDocument();
  });
});

// ── US3: Inline error clearing ─────────────────────────────────────────────

describe("AdditionalQuestions – Inline error clearing", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmit.mockReset();
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });
  });

  it("clears selectedGoals error when a goal is toggled after validation fires", async () => {
    renderPage();
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-selectedGoals")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("trigger-goal-goal1"));
    await waitFor(() => {
      expect(screen.queryByTestId("field-error-selectedGoals")).not.toBeInTheDocument();
    });
  });

  it("clears annual-raises error when an answer is selected after validation fires", async () => {
    renderPage();
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-annual-raises")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("trigger-annual-raises-no-raises"));
    await waitFor(() => {
      expect(screen.queryByTestId("field-error-annual-raises")).not.toBeInTheDocument();
    });
  });

  it("clears health-plan-monthly-premium error when onHealthPremiumMonthlyChange is called", async () => {
    renderPage();
    clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("field-error-health-plan-monthly-premium")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("trigger-health-premium-monthly-300"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("field-error-health-plan-monthly-premium")
      ).not.toBeInTheDocument();
    });
  });

  it("resets retirementMatchPercentage when employer-match changes to no-match", async () => {
    renderPage();
    // Set yes-match and a percentage
    fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-yes-match"));
    fireEvent.click(screen.getByTestId("trigger-retirement-match-percentage-5"));
    // Switch to no-match (should reset the percentage internally)
    fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-no-match"));
    // Click Next — since retirement-employer-match is now "no-match", no percentage validation
    clickNext();
    await waitFor(() => {
      expect(screen.queryByTestId("field-error-retirementMatchPercentage")).not.toBeInTheDocument();
    });
  });
});

// ── US4: Submission payload construction ───────────────────────────────────

describe("AdditionalQuestions – Submission payload", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmit.mockReset();
    mockBuildPayload.mockReturnValue({
      workforce: {},
      compensation: {},
      benefits: {},
      goals: {},
    });
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });
  });

  it("calls buildFinchAssessmentPayload with correct arguments on valid no-match submission", async () => {
    renderPage();
    fillAllRequiredFields(); // uses no-match path, ADP, january, 300
    clickNext();
    await waitFor(() => {
      expect(mockBuildPayload).toHaveBeenCalledWith(
        expect.any(Object), // answers
        expect.any(Object), // goalsAnswers
        "", // annualRaiseMonth (no-raises path)
        "ADP", // payrollProvider
        "january", // benefitsEnrollmentMonth
        false, // retirementPlanHasMatch (no-match)
        "", // retirementMatchPercentage
        "300" // healthPremiumMonthly
      );
    });
  });

  it("calls buildFinchAssessmentPayload with retirementPlanHasMatch=true when yes-match", async () => {
    renderPage();
    // Fill all required fields (no-match path first)
    fillAllRequiredFields();
    // Override to yes-match with percentage 5
    fireEvent.click(screen.getByTestId("trigger-retirement-employer-match-yes-match"));
    fireEvent.click(screen.getByTestId("trigger-retirement-match-percentage-5"));
    clickNext();
    await waitFor(() => {
      expect(mockBuildPayload).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "",
        "ADP",
        "january",
        true, // retirementPlanHasMatch = true
        "5", // retirementMatchPercentage
        "300"
      );
    });
  });

  it("calls submit() with the payload returned by buildFinchAssessmentPayload", async () => {
    const knownPayload = {
      workforce: { hasDesklessEmployees: false },
      compensation: { payrollProvider: "ADP" },
      benefits: { lowestHealthPlanPremium: 300 },
      goals: { workforceGoals: [] },
    };
    mockBuildPayload.mockReturnValue(knownPayload as never);

    renderPage();
    fillAllRequiredFields();
    clickNext();

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(knownPayload);
    });
  });

  it("does not call submit() when validation fails", async () => {
    renderPage();
    clickNext(); // empty form — validation fails
    await waitFor(() => {
      expect(screen.getByTestId("field-error-selectedGoals")).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("passes healthPremiumMonthly as the 8th argument", async () => {
    renderPage();
    fillAllRequiredFields();
    clickNext();
    await waitFor(() => {
      const callArgs = mockBuildPayload.mock.calls[0];
      expect(callArgs[7]).toBe("300");
    });
  });
});

// ── US5: Error and success display ────────────────────────────────────────

describe("AdditionalQuestions – Error and success display", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmit.mockReset();
    mockClearError.mockReset();
  });

  it("renders API error message when hook returns error", () => {
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: "Something went wrong",
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });

    renderPage();

    expect(screen.getByTestId("error-message")).toHaveTextContent("Something went wrong");
  });

  it("renders success message and navigates to dashboard when hook returns success", async () => {
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: true,
      submit: mockSubmit,
      clearError: mockClearError,
    });

    renderPage();

    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Assessment submitted successfully!"
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows Submitting... text and disabled Next button when isSubmitting is true", () => {
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: true,
      error: null,
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });

    renderPage();

    const nextButton = screen.getByRole("button", { name: /submitting/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it("calls clearError when the error message close button is clicked", () => {
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: "An API error occurred",
      success: false,
      submit: mockSubmit,
      clearError: mockClearError,
    });

    renderPage();

    fireEvent.click(screen.getByTestId("error-close"));
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
