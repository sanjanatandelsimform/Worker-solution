/**
 * CoreBenefitsEnhancement Tests
 *
 * Tests for dynamic proven strategy card content: icon and description
 * both driven by provenStrategyFlags from the API response.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoreBenefitsEnhancement from "@/pages/recommendations/CoreBenefitsEnhancement";

const defaultProps = {
  isLoading: false,
  provenStrategiesCount: 0,
  provenStrategiesPercent: 0,
  provenStrategyFlags: {
    nonElectiveMatch: false,
    autoEnroll: false,
    healthcareAffordability: false,
  },
};

describe("CoreBenefitsEnhancement — icon per flag", () => {
  it("shows UserGroupIcon for all cards when all flags are false", () => {
    const { container } = render(<CoreBenefitsEnhancement {...defaultProps} />);

    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(0);
  });

  it("shows LikeIcon for all cards when all flags are true", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{
          nonElectiveMatch: true,
          autoEnroll: true,
          healthcareAffordability: true,
        }}
      />
    );

    expect(container.querySelectorAll('[data-testid="like-icon"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-testid="user-group-icon"]')).toHaveLength(0);
  });

  it("shows correct icons for mixed flags (nonElectiveMatch=true, others=false)", () => {
    const { container } = render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{
          nonElectiveMatch: true,
          autoEnroll: false,
          healthcareAffordability: false,
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
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, nonElectiveMatch: true }}
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
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, autoEnroll: true }}
      />
    );
    expect(screen.getByText(staticDesc)).toBeInTheDocument();
  });

  it("shows flag=false description for healthcareAffordability when flag is false", () => {
    render(<CoreBenefitsEnhancement {...defaultProps} />);

    expect(
      screen.getByText(
        "Consider adjusting employee premiums to income level. QSEHRA and ICHRA plans can offer more flexibility and savings for employers and employees."
      )
    ).toBeInTheDocument();
  });

  it("shows flag=true description for healthcareAffordability when flag is true", () => {
    render(
      <CoreBenefitsEnhancement
        {...defaultProps}
        provenStrategyFlags={{ ...defaultProps.provenStrategyFlags, healthcareAffordability: true }}
      />
    );

    expect(
      screen.getByText(
        "Your employee-only premium contribution to earnings average is below 11%, which is a positive indicator of healthcare affordability. (IRS affordability is 9.96%)"
      )
    ).toBeInTheDocument();
  });
});
