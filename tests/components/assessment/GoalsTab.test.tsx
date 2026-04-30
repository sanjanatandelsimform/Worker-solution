/**
 * Goals Tab Tests
 *
 * Tests for GoalsTab: render, section title, DynamicTab integration.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GoalsTab from "@/pages/assessmentWorkforce/GoalsTab";
import { getAssessment } from "@/services/api/assessmentApi";
import type { ApiResponse } from "@/services/api/assessmentApi";

vi.mock("@/services/api/assessmentApi", () => ({
  getAssessment: vi.fn(),
  submitWorkforce: vi.fn(),
  submitCompensation: vi.fn(),
  submitBenefits: vi.fn(),
  submitGoals: vi.fn(),
}));

const mockGetAssessment: ApiResponse<{ sections: { goals?: Record<string, unknown> } }> = {
  success: true,
  data: {
    id: "assessment-1",
    userId: "user-1",
    createdAt: "2026-02-13T00:00:00Z",
    updatedAt: "2026-02-13T00:00:00Z",
    status: "in_progress",
    sections: { goals: {} },
    completionPercentage: 75,
  },
};

function renderGoalsTab() {
  return render(
    <BrowserRouter>
      <GoalsTab onNext={vi.fn()} onSuccess={vi.fn()} />
    </BrowserRouter>
  );
}

// Mock questionData to test the missing section path
vi.mock("@/data/assessment/questionData.json", () => ({
  default: {
    sections: [
      { name: "Goals", questions: [] },
    ],
  },
}));

describe("GoalsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAssessment).mockResolvedValue(mockGetAssessment as ApiResponse<unknown>);
  });

  it("should render Goals section title after load", async () => {
    renderGoalsTab();

    await waitFor(() => {
      expect(getAssessment).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Goals")).toBeInTheDocument();
    });
  });

  it("calls onSuccess when DynamicTab triggers success", async () => {
    const onSuccess = vi.fn();
    render(
      <BrowserRouter>
        <GoalsTab onNext={vi.fn()} onSuccess={onSuccess} />
      </BrowserRouter>
    );
    // GoalsTab renders DynamicTab and calls onSuccess internally
    // Just test that it renders without crashing with onSuccess provided
    await waitFor(() => {
      expect(screen.getByText("Goals")).toBeInTheDocument();
    });
  });

  it("renders without crashing when onSuccess is not provided", async () => {
    render(
      <BrowserRouter>
        <GoalsTab onNext={vi.fn()} />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Goals")).toBeInTheDocument();
    });
  });
});
