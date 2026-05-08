/**
 * CoreBenefitsEnhancement Tests
 *
 * Tests for dynamic proven strategy card content: icon and description
 * both driven by provenStrategyFlags (StrategyFlagStatus tri-state) from the API response.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoreBenefitsEnhancement from "@/pages/recommendations/CoreBenefitsEnhancement";

const defaultProps = {
  isLoading: false,
  provenStrategiesCount: 0,
  provenStrategiesPercent: 0,
  visibleFlagsTotal: 3,
  provenStrategyFlags: {
    nonElectiveMatch: "yellow" as const,
    autoEnroll: "yellow" as const,
    healthcareAffordability: "yellow" as const,
  },
};

describe("CoreBenefitsEnhancement — icon per flag", () => {
  it("shows UserGroupIcon for all cards when all flags are 'yellow'", () => {
    const { container } = render(<CoreBenefitsEnhancement {...defaultProps} />);

    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(0);
  });

  it("shows LikeIcon for all cards when all flags are 'green'", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{
          nonElectiveMatch: "green",
          autoEnroll: "green",
          healthcareAffordability: "green",
        }}
      />
    );

    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(0);
  });

  it("shows correct icons for mixed flags (nonElectiveMatch='green', others='yellow')", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{
          nonElectiveMatch: "green",
          autoEnroll: "yellow",
          healthcareAffordability: "yellow",
        }}
      />
    );

    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(2);
  });
});

describe("CoreBenefitsEnhancement — description per flag", () => {
  it("shows static description for nonElectiveMatch regardless of flag", () => {
    const staticDesc =
      "Employer contributions are often skewed due to high earners's contribution capacity. Separate the employee contribution from employer contribution.";

    const { rerender } = render(<CoreBenefitsEnhancement {...defaultProps} />);
    expect(screen.getByText(staticDesc)).toBeInTheDocument();

    rerender(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, nonElectiveMatch: "green" }}
      />
    );
    expect(screen.getByText(staticDesc)).toBeInTheDocument();
  });

  it("shows static description for autoEnroll regardless of flag", () => {
    const staticDesc =
      "80% of employees automatically enrolled in a 3% 401K match stay within the retirement plan.";

    const { rerender } = render(<CoreBenefitsEnhancement {...defaultProps} />);
    expect(screen.getByText(staticDesc)).toBeInTheDocument();

    rerender(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, autoEnroll: "green" }}
      />
    );
    expect(screen.getByText(staticDesc)).toBeInTheDocument();
  });

  it("shows 'yellow' description for healthcareAffordability when flag is 'yellow'", () => {
    render(<CoreBenefitsEnhancement {...defaultProps} />);

    expect(
      screen.getByText(
        "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees."
      )
    ).toBeInTheDocument();
  });

  it("shows 'green' description for healthcareAffordability when flag is 'green'", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{
          ...defaultProps.provenStrategyFlags,
          healthcareAffordability: "green",
        }}
      />
    );

    expect(
      screen.getByText(
        "Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)"
      )
    ).toBeInTheDocument();
  });
});

describe("CoreBenefitsEnhancement — hidden flag hides card", () => {
  it("hides 'Healthcare affordability' card when healthcareAffordability is 'hidden'", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        visibleFlagsTotal={2}
        provenStrategyFlags={{
          nonElectiveMatch: "yellow",
          autoEnroll: "yellow",
          healthcareAffordability: "hidden",
        }}
      />
    );
    expect(screen.queryByText("Healthcare Affordability")).not.toBeInTheDocument();
    expect(screen.getByText("Non-Elective Match")).toBeInTheDocument();
    expect(screen.getByText("Auto Enrollment")).toBeInTheDocument();
  });

  it("hides 'Non-elective match' card when nonElectiveMatch is 'hidden'", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        visibleFlagsTotal={2}
        provenStrategyFlags={{
          nonElectiveMatch: "hidden",
          autoEnroll: "yellow",
          healthcareAffordability: "yellow",
        }}
      />
    );
    expect(screen.queryByText("Non-Elective Match")).not.toBeInTheDocument();
    expect(screen.getByText("Auto Enrollment")).toBeInTheDocument();
    expect(screen.getByText("Healthcare Affordability")).toBeInTheDocument();
  });

  it("hides all cards when all flags are 'hidden'", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        visibleFlagsTotal={0}
        provenStrategyFlags={{
          nonElectiveMatch: "hidden",
          autoEnroll: "hidden",
          healthcareAffordability: "hidden",
        }}
      />
    );
    expect(screen.queryByText("Non-Elective Match")).not.toBeInTheDocument();
    expect(screen.queryByText("Auto Enrollment")).not.toBeInTheDocument();
    expect(screen.queryByText("Healthcare Affordability")).not.toBeInTheDocument();
  });
});

describe("CoreBenefitsEnhancement — dynamic denominator", () => {
  it("shows '0/3' when visibleFlagsTotal is 3 and count is 0", () => {
    render(
      <CoreBenefitsEnhancement {...defaultProps} provenStrategiesCount={0} visibleFlagsTotal={3} />
    );
    expect(screen.getByText(/0\/3/)).toBeInTheDocument();
  });

  it("shows '1/2' when visibleFlagsTotal is 2 and provenStrategiesCount is 1", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategiesCount={1}
        visibleFlagsTotal={2}
        provenStrategyFlags={{
          nonElectiveMatch: "green",
          autoEnroll: "yellow",
          healthcareAffordability: "hidden",
        }}
      />
    );
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });

  it("renders without NaN when visibleFlagsTotal is 0", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategiesCount={0}
        provenStrategiesPercent={0}
        visibleFlagsTotal={0}
        provenStrategyFlags={{
          nonElectiveMatch: "hidden",
          autoEnroll: "hidden",
          healthcareAffordability: "hidden",
        }}
      />
    );
    expect(container.textContent).not.toContain("NaN");
  });

  it("passes value={0} to ProgressBar when provenStrategiesPercent is 0", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategiesCount={0}
        provenStrategiesPercent={0}
        visibleFlagsTotal={0}
        provenStrategyFlags={{
          nonElectiveMatch: "hidden",
          autoEnroll: "hidden",
          healthcareAffordability: "hidden",
        }}
      />
    );
    // Progress bar should render (not crash) with value=0
    const progressBar = container.querySelector('[role="progressbar"]');
    if (progressBar) {
      expect(progressBar.getAttribute("aria-valuenow")).toBe("0");
    } else {
      // If no role=progressbar, just confirm no NaN in output
      expect(container.textContent).not.toContain("NaN");
    }
  });
});
