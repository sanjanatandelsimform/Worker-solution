/**
 * Compensation Tab Tests
 *
 * Tests for CompensationTab: render, section title, validation.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CompensationTab from "@/pages/assessmentWorkforce/CompensationTab";
import { getAssessment } from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

const mockGetAssessment: ApiResponse<{ sections: { compensation?: Record<string, unknown> } }> = {
  success: true,
  data: {
    id: "assessment-1",
    userId: "user-1",
    createdAt: "2026-02-13T00:00:00Z",
    updatedAt: "2026-02-13T00:00:00Z",
    status: "in_progress",
    sections: { compensation: {} },
    completionPercentage: 25,
  },
};

function renderCompensationTab() {
  return render(
    <BrowserRouter>
      <CompensationTab onNext={vi.fn()} onSuccess={vi.fn()} />
    </BrowserRouter>
  );
}

describe("CompensationTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAssessment).mockResolvedValue(mockGetAssessment as ApiResponse<unknown>);
  });

  it("should render Compensation section title after load", async () => {
    renderCompensationTab();

    await waitFor(() => {
      expect(getAssessment).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Compensation")).toBeInTheDocument();
    });
  });
});
