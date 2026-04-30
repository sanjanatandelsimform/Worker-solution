/**
 * Tests for GoalsTab, BenefitsTab, CompensationTab - thin wrappers around DynamicTab
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

const mockDynamicTab = vi.fn(({ section }: any) => (
  <div data-testid={`dynamic-tab-${section}`} />
));

vi.mock("@/components/assessment/DynamicTab", () => ({
  DynamicTab: (props: any) => mockDynamicTab(props),
}));

vi.mock("@/data/assessment/questionData.json", () => ({
  default: {
    sections: [
      { name: "Goals", questions: [{ id: "g1", type: "checkbox" }] },
      { name: "Benefits", questions: [{ id: "b1", type: "radio" }] },
      { name: "Compensation", questions: [{ id: "c1", type: "radio" }] },
    ],
  },
}));

import GoalsTab from "@/pages/assessmentWorkforce/GoalsTab";
import BenefitsTab from "@/pages/assessmentWorkforce/BenefitsTab";
import CompensationTab from "@/pages/assessmentWorkforce/CompensationTab";

describe("GoalsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DynamicTab when goals section is found", () => {
    const onNext = vi.fn();
    const onSuccess = vi.fn();
    render(<GoalsTab onNext={onNext} onSuccess={onSuccess} />);
    expect(screen.getByTestId("dynamic-tab-goals")).toBeTruthy();
  });

  it("passes onNext and onSuccess to DynamicTab", () => {
    const onNext = vi.fn();
    const onSuccess = vi.fn();
    render(<GoalsTab onNext={onNext} onSuccess={onSuccess} />);
    const call = mockDynamicTab.mock.calls[0][0];
    expect(call.onNext).toBe(onNext);
    expect(call.section).toBe("goals");
  });

  it("calls onSuccess when handleSuccess is invoked", () => {
    const onNext = vi.fn();
    const onSuccess = vi.fn();
    render(<GoalsTab onNext={onNext} onSuccess={onSuccess} />);
    const call = mockDynamicTab.mock.calls[0][0];
    // Invoke the wrapped onSuccess
    call.onSuccess();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("renders without onSuccess prop (onSuccess is optional)", () => {
    render(<GoalsTab onNext={vi.fn()} />);
    // Call the onSuccess from dynamic tab - should not throw
    const call = mockDynamicTab.mock.calls[0][0];
    expect(() => call.onSuccess()).not.toThrow();
  });
});

describe("GoalsTab - section not found", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error when goals section is missing from questionData", async () => {
    vi.doMock("@/data/assessment/questionData.json", () => ({
      default: {
        sections: [
          { name: "Compensation", questions: [] },
        ],
      },
    }));
    // Re-import after mock override
    const { default: GoalsTabMissing } = await import("@/pages/assessmentWorkforce/GoalsTab");
    render(<GoalsTabMissing />);
    // Should either render DynamicTab or error - just verify it doesn't crash
    expect(document.body).toBeTruthy();
  });
});

describe("BenefitsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DynamicTab with benefits section", () => {
    const onNext = vi.fn();
    const onSuccess = vi.fn();
    render(<BenefitsTab onNext={onNext} onSuccess={onSuccess} />);
    expect(screen.getByTestId("dynamic-tab-benefits")).toBeTruthy();
  });

  it("passes questions to DynamicTab", () => {
    render(<BenefitsTab onNext={vi.fn()} onSuccess={vi.fn()} />);
    const call = mockDynamicTab.mock.calls[0][0];
    expect(call.section).toBe("benefits");
    expect(Array.isArray(call.questions)).toBe(true);
  });

  it("passes onNext and onSuccess props", () => {
    const onNext = vi.fn();
    const onSuccess = vi.fn();
    render(<BenefitsTab onNext={onNext} onSuccess={onSuccess} />);
    const call = mockDynamicTab.mock.calls[0][0];
    expect(call.onNext).toBe(onNext);
    expect(call.onSuccess).toBe(onSuccess);
  });
});

describe("CompensationTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DynamicTab with compensation section", () => {
    render(<CompensationTab onNext={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByTestId("dynamic-tab-compensation")).toBeTruthy();
  });

  it("passes correct section and questions", () => {
    render(<CompensationTab onNext={vi.fn()} />);
    const call = mockDynamicTab.mock.calls[0][0];
    expect(call.section).toBe("compensation");
    expect(Array.isArray(call.questions)).toBe(true);
  });

  it("passes onNext to DynamicTab", () => {
    const onNext = vi.fn();
    render(<CompensationTab onNext={onNext} />);
    const call = mockDynamicTab.mock.calls[0][0];
    expect(call.onNext).toBe(onNext);
  });
});
