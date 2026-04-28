/**
 * Tests for AdditionalQuestions page
 *
 * Covers: redirect to dashboard when isFinchCompleted is true,
 * redirect to dashboard when isConnected is false (and not loading),
 * no redirect when isFinchCompleted is false and isConnected is true,
 * redirect when success is true, and redirect on close button click.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAssessmentStatus } from "@/hooks/useAssessmentStatus";
import { useSubmitFinchAssessment } from "@/hooks/useSubmitFinchAssessment";

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
    isConnected: true,
    isFetched: true,
    completionCount: 0,
    isLoading: false,
    error: null,
    assessmentData: { assessmentType: "finch", data: { status: "in_progress" } },
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

// Stub section components — redirect tests only care about navigation
vi.mock("@/pages/additionalQuestions/WorkforceSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/CompensationSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/BenefitsRetirementSection", () => ({
  default: () => null,
}));
vi.mock("@/pages/additionalQuestions/GoalsSection", () => ({
  default: () => null,
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
vi.mock("@/components/common/ErrorMessage", () => ({
  default: ({ errorMessage }: { errorMessage: string }) => (
    <div data-testid="error-message">{errorMessage}</div>
  ),
}));
vi.mock("@/data/goalsData", () => ({ goalsData: [] }));
vi.mock("@/utils/finchAssessmentPayload", () => ({
  buildFinchAssessmentPayload: vi.fn(),
}));

// ── Import page after all mocks ────────────────────────────────────────────
const { default: AdditionalQuestions } =
  await import("@/pages/additionalQuestions/AdditionalQuestions");

const mockUseAssessmentStatus = vi.mocked(useAssessmentStatus);
const mockUseSubmitFinchAssessment = vi.mocked(useSubmitFinchAssessment);

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
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: false,
      submit: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it("redirects to /dashboard when isFinchCompleted is true", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: true,
      isConnected: true,
      isFetched: true,
      completionCount: 4,
      isLoading: false,
      error: null,
      assessmentData: { assessmentType: "finch", data: { status: "completed" } },
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
      isConnected: true,
      isFetched: true,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: { assessmentType: "finch", data: { status: "in_progress" } },
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to /dashboard when assessment is not Finch and not loading", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: false,
      isConnected: false,
      isFetched: true,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: { assessmentType: "manual", data: { status: "in_progress" } },
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not redirect when assessment is loading and assessmentType is not finch", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: false,
      isConnected: false,
      isFetched: true,
      completionCount: 0,
      isLoading: true,
      error: null,
      assessmentData: { assessmentType: "manual", data: { status: "in_progress" } },
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not redirect when assessmentType is finch and isFinchCompleted is false", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: false,
      isConnected: true,
      isFetched: true,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: { assessmentType: "finch", data: { status: "in_progress" } },
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("navigates to /dashboard when success is true", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: false,
      isConnected: true,
      isFetched: true,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: { assessmentType: "finch", data: { status: "in_progress" } },
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });
    mockUseSubmitFinchAssessment.mockReturnValue({
      isSubmitting: false,
      error: null,
      success: true,
      submit: vi.fn(),
      clearError: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("navigates to /dashboard when the close button is clicked", async () => {
    mockUseAssessmentStatus.mockReturnValue({
      isFinchCompleted: false,
      isConnected: true,
      isFetched: true,
      completionCount: 0,
      isLoading: false,
      error: null,
      assessmentData: { assessmentType: "finch", data: { status: "in_progress" } },
      sectionCompletion: { workforce: false, compensation: false, benefits: false, goals: false },
      refetch: vi.fn(),
    });

    renderPage();

    // The X close button has no text; it's the button that is NOT "Next"
    const allButtons = screen.getAllByRole("button");
    const closeButton = allButtons.find(btn => btn.textContent?.trim() === "");
    expect(closeButton).toBeDefined();
    if (!closeButton) {
      throw new Error("Close button not found");
    }
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
