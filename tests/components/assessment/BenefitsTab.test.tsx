/**
 * Benefits Tab Tests
 *
 * Tests for BenefitsTab: render, section title.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BenefitsTab from "@/pages/assessmentWorkforce/BenefitsTab";
import { getAssessment } from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

const mockGetAssessment: ApiResponse<{ sections: { benefits?: Record<string, unknown> } }> = {
  success: true,
  data: {
    id: "assessment-1",
    userId: "user-1",
    createdAt: "2026-02-13T00:00:00Z",
    updatedAt: "2026-02-13T00:00:00Z",
    status: "in_progress",
    sections: { benefits: {} },
    completionPercentage: 50,
  },
};

function renderBenefitsTab() {
  return render(
    <BrowserRouter>
      <BenefitsTab onNext={vi.fn()} onSuccess={vi.fn()} />
    </BrowserRouter>
  );
}

describe("BenefitsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAssessment).mockResolvedValue(mockGetAssessment as ApiResponse<unknown>);
  });

  it("should render Benefits section title after load", async () => {
    renderBenefitsTab();

    await waitFor(() => {
      expect(getAssessment).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Benefits")).toBeInTheDocument();
    });
  });
});
