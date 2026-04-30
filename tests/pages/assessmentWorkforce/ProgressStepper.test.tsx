import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProgressStepper } from "@/pages/assessmentWorkforce/ProgressStepper";

vi.mock("@/assets/icons/TabArrow", () => ({
  TabArrow: ({ className }: { className?: string }) => <span data-testid="tab-arrow" className={className} />,
}));

const steps = [
  { id: "workforce", label: "Workforce" },
  { id: "compensation", label: "Compensation" },
  { id: "benefits", label: "Benefits" },
];

describe("ProgressStepper", () => {
  it("allows clicking completed/current steps and blocks future steps", () => {
    const onStepChange = vi.fn();
    render(
      <ProgressStepper
        steps={steps}
        currentStep="workforce"
        resolvedStep="compensation"
        completedSteps={["workforce"]}
        onStepChange={onStepChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Workforce" }));
    fireEvent.click(screen.getByRole("button", { name: "Compensation" }));
    fireEvent.click(screen.getByRole("button", { name: "Benefits" }));

    expect(onStepChange).toHaveBeenCalledWith("workforce");
    expect(onStepChange).toHaveBeenCalledWith("compensation");
    expect(onStepChange).not.toHaveBeenCalledWith("benefits");
  });

  it("handles hover style branches for clickable and non-clickable steps", () => {
    render(
      <ProgressStepper
        steps={steps}
        currentStep="workforce"
        resolvedStep="workforce"
        completedSteps={["workforce"]}
      />
    );

    const workforce = screen.getByRole("button", { name: "Workforce" });
    const benefits = screen.getByRole("button", { name: "Benefits" });

    fireEvent.mouseEnter(workforce);
    fireEvent.mouseLeave(workforce);
    fireEvent.mouseEnter(benefits);

    expect(screen.getAllByTestId("tab-arrow").length).toBe(2);
  });
});
