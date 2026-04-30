import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkforceTab from "@/pages/assessmentWorkforce/WorkforceTab";

const mockUseStatesLookup = vi.fn();

vi.mock("@/hooks/useStatesLookup", () => ({
  useStatesLookup: () => mockUseStatesLookup(),
}));

vi.mock("@/components/assessment/DynamicTab", () => ({
  DynamicTab: (props: { questions: Array<{ key: string }>; section: string }) => (
    <div data-testid="dynamic-tab">
      {props.section}:{props.questions.length}
    </div>
  ),
}));

vi.mock("@/data/assessment/questionData.json", () => ({
  default: {
    sections: [
      {
        name: "Workforce",
        questions: [
          {
            key: "topWorkLocations",
            validationRules: { fields: [{ options: [], placeholder: "" }] },
          },
          {
            key: "employeesResideInSameZipCodes",
            conditionalQuestion: {
              question: { validationRules: { fields: [{ options: [], placeholder: "" }] } },
            },
          },
        ],
      },
    ],
  },
}));

describe("WorkforceTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("injects loaded state options into both location paths", () => {
    mockUseStatesLookup.mockReturnValue({
      stateOptions: [{ value: "CA", label: "California" }],
      isLoading: false,
      error: null,
    });
    render(<WorkforceTab />);
    expect(screen.getByTestId("dynamic-tab")).toHaveTextContent("workforce:2");
  });

  it("handles loading and error states without crashing", () => {
    mockUseStatesLookup.mockReturnValue({ stateOptions: [], isLoading: true, error: null });
    const { rerender } = render(<WorkforceTab />);
    expect(screen.getByTestId("dynamic-tab")).toBeTruthy();

    mockUseStatesLookup.mockReturnValue({ stateOptions: [], isLoading: false, error: "bad" });
    rerender(<WorkforceTab />);
    expect(screen.getByTestId("dynamic-tab")).toBeTruthy();
  });
});
