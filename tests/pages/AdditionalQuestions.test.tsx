/**
 * Tests for AdditionalQuestions page
 *
 * Covers: redirect to dashboard when isFinchCompleted is true,
 * and no redirect when isFinchCompleted is false.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: vi.fn(() => ({
    isFinchCompleted: false,
    completionCount: 0,
    isLoading: false,
    error: null,
    assessmentData: null,
    sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
    refetch: vi.fn(),
  })),
}));

vi.mock("@/hooks/useSubmitFinchAssessment", () => ({
  useSubmitFinchAssessment: vi.fn(() => ({
    isSubmitting: false,
    error: null,
    success: false,
    submit: vi.fn(),
    clearError: vi.fn(),
  })),
}));

// Stub heavy child components / assets to keep test fast
vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
vi.mock("@/components/common/RankList", () => ({
  RankingList: () => null,
}));
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@untitledui/icons", () => ({
  ChevronRight: () => null,
  InfoCircle: () => null,
  XClose: () => null,
}));

vi.mock("@/components/base/select/select", () => ({
  Select: () => null,
}));
vi.mock("@/components/base/select/select-item", () => ({
  SelectItem: () => null,
}));
vi.mock("@/components/base/radio-buttons/radio-buttons", () => ({
  RadioButton: () => null,
  RadioGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/base/input/label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));
vi.mock("@/components/base/checkbox/checkbox", () => ({
  Checkbox: () => null,
}));
vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage }: { errorMessage: string }) => (
    <div data-testid="error-message">{errorMessage}</div>
  ),
}));
vi.mock("@/assets/icons/inputInfo", () => ({ InputInfo: () => null }));
vi.mock("@/data/goalsData", () => ({ goalsData: [] }));
vi.mock("@/utils/finchAssessmentPayload", () => ({
  buildFinchAssessmentPayload: vi.fn(),
}));

// ── Import page after all mocks ────────────────────────────────────────────
const { default: AdditionalQuestions } =
  await import("@/pages/additionalQuestions/AdditionalQuestions");

const mockUseAssessmentStatus = vi.mocked(useAssessmentStatus);

// ── Helpers ────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdditionalQuestions />
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AdditionalQuestions – redirect behaviour", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("redirects to /dashboard when isFinchCompleted is true", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: true,
      completionCount: 4,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: true, compensation: true, benefits: true, goals: true },
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not redirect when isFinchCompleted is false", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: false,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: null,
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
    });
  });
});
