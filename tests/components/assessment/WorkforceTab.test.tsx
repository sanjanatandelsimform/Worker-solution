/**
 * Workforce Tab Tests
 *
 * Tests for WorkforceTab: render, section title, validation on Next, and DynamicTab integration.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import WorkforceTab from "@/pages/assessmentWorkforce/WorkforceTab";
import { getAssessment } from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

const mockGetAssessmentEmpty: ApiResponse<{ sections: { workforce?: Record<string, unknown> } }> = {
  success: true,
  data: {
    id: "assessment-1",
    userId: "user-1",
    createdAt: "2026-02-13T00:00:00Z",
    updatedAt: "2026-02-13T00:00:00Z",
    status: "in_progress",
    sections: {
      workforce: {},
    },
    completionPercentage: 0,
  },
};

function renderWorkforceTab() {
  return render(
    <BrowserRouter>
      <WorkforceTab onNext={vi.fn()} onSuccess={vi.fn()} />
    </BrowserRouter>
  );
}

describe("WorkforceTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAssessment).mockResolvedValue(mockGetAssessmentEmpty as ApiResponse<unknown>);
  });

  it("should render Workforce section title after load", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      expect(getAssessment).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Workforce")).toBeInTheDocument();
    });
  });

  it("should expose validation and validate returns false when required fields empty", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      expect(
        (window as { __dynamicTabValidation?: { validate: () => boolean } }).__dynamicTabValidation
      ).toBeDefined();
    });

    const validation = (window as { __dynamicTabValidation?: { validate: () => boolean } })
      .__dynamicTabValidation;
    const result = validation!.validate();
    expect(result).toBe(false);
  });

  it("should have getErrors returning object with errors when validation fails", async () => {
    renderWorkforceTab();

    await waitFor(() => {
      expect(
        (window as { __dynamicTabValidation?: { getErrors: () => Record<string, string> } })
          .__dynamicTabValidation
      ).toBeDefined();
    });

    const validation = (
      window as {
        __dynamicTabValidation?: {
          validate: () => boolean;
          getErrors: () => Record<string, string>;
        };
      }
    ).__dynamicTabValidation;
    validation!.validate();
    const errors = validation!.getErrors();
    expect(errors).toBeDefined();
    expect(typeof errors).toBe("object");
  });
});
