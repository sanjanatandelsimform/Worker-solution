import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { useWorkforceParticipationConfig } from "../../src/hooks/useWorkforceParticipationConfig";

// Mock Redux hooks
const mockUseAppSelector = vi.fn();
vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

// Mock selectors
vi.mock("@/store/selectors/workforceSelectors", () => ({
  selectParticipationSection: (state: any) => state,
}));

// Mock icon components
vi.mock("@/assets/icons/EnrolledIcon", () => ({
  EnrolledIcon: ({ className }: any) => <span className={className} />,
}));
vi.mock("@/assets/icons/SavingIcon", () => ({
  SavingIcon: ({ className }: any) => <span className={className} />,
}));
vi.mock("@/assets/icons/HeartLineIcon", () => ({
  HeartLineIcon: ({ className }: any) => <span className={className} />,
}));

// Mock parsePercentage
vi.mock("@/pages/workforce/workforceUtils", () => ({
  parsePercentage: (val: any) => (typeof val === "string" ? parseFloat(val) : val ?? 0),
}));

describe("useWorkforceParticipationConfig", () => {
  it("returns empty items when participationSection is null", () => {
    mockUseAppSelector.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkforceParticipationConfig());
    
    expect(result.current.participationCardsConfig).toHaveLength(3);
    expect(result.current.participationCardsConfig[0].count).toBe("--");
    expect(result.current.participationCardsConfig[1].count).toBe("--");
    expect(result.current.participationCardsConfig[2].count).toBe("--");
    expect(result.current.benefitsItems).toHaveLength(0);
    expect(result.current.retirementItems).toHaveLength(0);
    expect(result.current.insuranceItems).toHaveLength(0);
  });

  it("returns formatted items when participationSection has data", () => {
    mockUseAppSelector.mockReturnValue({
      enrolledBenefits: 150,
      retirementEnrollment: "75%",
      healthcareEnrollment: "80%",
      benefits: [
        { name: "Health Insurance", enrollment: "90%" },
        { name: "Dental", enrollment: "70%" },
      ],
      retirement: [
        { name: "401k", enrollment: "60%" },
      ],
      insurance: [
        { name: "Life Insurance", enrollment: "40%" },
      ],
    });

    const { result } = renderHook(() => useWorkforceParticipationConfig());

    // Cards config
    expect(result.current.participationCardsConfig[0].count).toBe("150");
    expect(result.current.participationCardsConfig[1].count).toBe("75%");
    expect(result.current.participationCardsConfig[2].count).toBe("80%");

    // Benefits items
    expect(result.current.benefitsItems).toHaveLength(2);
    expect(result.current.benefitsItems[0].label).toBe("Health Insurance");
    expect(result.current.benefitsItems[0].progressColor).toBe("bg-ws-navy-300");

    // Retirement items
    expect(result.current.retirementItems).toHaveLength(1);
    expect(result.current.retirementItems[0].label).toBe("401k");
    expect(result.current.retirementItems[0].progressColor).toBe("bg-ws-light-teal-400");

    // Insurance items
    expect(result.current.insuranceItems).toHaveLength(1);
    expect(result.current.insuranceItems[0].label).toBe("Life Insurance");
    expect(result.current.insuranceItems[0].progressColor).toBe("bg-ws-light-teal-300");
  });

  it("handles 0 enrolledBenefits gracefully", () => {
    mockUseAppSelector.mockReturnValue({
      enrolledBenefits: 0,
      retirementEnrollment: null,
      healthcareEnrollment: undefined,
      benefits: [],
      retirement: [],
      insurance: [],
    });

    const { result } = renderHook(() => useWorkforceParticipationConfig());

    expect(result.current.participationCardsConfig[0].count).toBe("0");
    expect(result.current.participationCardsConfig[1].count).toBe("--");
    expect(result.current.participationCardsConfig[2].count).toBe("--");
  });

  it("includes countIcon for each card", () => {
    mockUseAppSelector.mockReturnValue({
      enrolledBenefits: 100,
      retirementEnrollment: "50%",
      healthcareEnrollment: "60%",
      benefits: [],
      retirement: [],
      insurance: [],
    });

    const { result } = renderHook(() => useWorkforceParticipationConfig());

    result.current.participationCardsConfig.forEach(card => {
      expect(card.countIcon).toBeTruthy();
    });
  });
});
