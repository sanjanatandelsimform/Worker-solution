/**
 * useWorkforceOverviewConfig Hook Tests
 *
 * Covers: null/fallback state, formatted card counts, card ids/titles,
 * getCountClass(), getDescriptionText(), and empty employeeCardsConfig.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { WorkforceOverview } from "@/types/workforceTypes";
import { useWorkforceOverviewConfig } from "@/hooks/useWorkforceOverviewConfig";

// ── Shared mutable mock state ──────────────────────────────────────────────

let mockWorkforceSection: WorkforceOverview | null = null;

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (state: object) => unknown) => selector(mockStoreState),
}));

let mockStoreState: object = { workforce: { data: null } };

// ── Helpers ────────────────────────────────────────────────────────────────

function buildStoreState(workforceSection: WorkforceOverview | null) {
  if (workforceSection === null) {
    return { workforce: { data: null } };
  }
  return {
    workforce: {
      data: {
        assessmentType: "finch",
        workforce: {
          dataStatus: "complete",
          workforce: workforceSection,
          participation: null,
          demographics: null,
          compensation: null,
        },
      },
    },
  };
}

const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

const sampleWorkforceSection: WorkforceOverview = {
  totalWorkforce: 1234,
  enrolledBenefits: 987,
  avgEmployeeCost: 4567,
  employerCostPerEmployee: 11240,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useWorkforceOverviewConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkforceSection = null;
    mockStoreState = buildStoreState(null);
  });

  // ── Null / fallback state ───────────────────────────────────────────────

  it("returns '--' for all counts when workforceSection is null", () => {
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    const cards = result.current.overviewCardsConfig;
    expect(cards).toHaveLength(4);
    cards.forEach(card => {
      expect(card.count).toBe("--");
    });
  });

  it("employeeCardsConfig is always an empty array", () => {
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    expect(result.current.employeeCardsConfig).toEqual([]);
  });

  // ── Card IDs and titles ────────────────────────────────────────────────

  it("overviewCardsConfig has correct ids and titles", () => {
    mockStoreState = buildStoreState(sampleWorkforceSection);
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    const cards = result.current.overviewCardsConfig;

    expect(cards[0].id).toBe("total-workforce");
    expect(cards[0].title).toBe("Total Workforce");

    expect(cards[1].id).toBe("enrolled-benefits");
    expect(cards[1].title).toBe("Enrolled in Benefits");

    expect(cards[2].id).toBe("avg-employee-cost");
    expect(cards[2].title).toBe("Avg. Employee Cost Per Pay Period");

    expect(cards[3].id).toBe("employer-cost");
    expect(cards[3].title).toBe("Employer Cost Per Employee");
  });

  // ── Formatted counts ───────────────────────────────────────────────────

  it("totalWorkforce is formatted with toLocaleString", () => {
    mockStoreState = buildStoreState({ ...sampleWorkforceSection, totalWorkforce: 1234 });
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    expect(result.current.overviewCardsConfig[0].count).toBe((1234).toLocaleString());
  });

  it("enrolledBenefits is formatted with toLocaleString", () => {
    mockStoreState = buildStoreState({ ...sampleWorkforceSection, enrolledBenefits: 987 });
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    expect(result.current.overviewCardsConfig[1].count).toBe((987).toLocaleString());
  });

  it("avgEmployeeCost is formatted with '$' prefix", () => {
    mockStoreState = buildStoreState({ ...sampleWorkforceSection, avgEmployeeCost: 4567 });
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    expect(result.current.overviewCardsConfig[2].count).toBe(`$${(4567).toLocaleString()}`);
  });

  it("employerCostPerEmployee is formatted with '$' prefix and '/yr' suffix", () => {
    mockStoreState = buildStoreState({
      ...sampleWorkforceSection,
      employerCostPerEmployee: 11240,
    });
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    expect(result.current.overviewCardsConfig[3].count).toBe(`$${(11240).toLocaleString()}/yr`);
  });

  it("handles 0 values correctly (not shown as '--')", () => {
    mockStoreState = buildStoreState({
      totalWorkforce: 0,
      enrolledBenefits: 0,
      avgEmployeeCost: 0,
      employerCostPerEmployee: 0,
    });
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    const cards = result.current.overviewCardsConfig;
    expect(cards[0].count).toBe("0");
    expect(cards[1].count).toBe("0");
    expect(cards[2].count).toBe("$0");
    expect(cards[3].count).toBe("$0/yr");
  });

  // ── getCountClass ──────────────────────────────────────────────────────

  it("getCountClass() returns the correct CSS class string for all cards", () => {
    mockStoreState = buildStoreState(sampleWorkforceSection);
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    result.current.overviewCardsConfig.forEach(card => {
      expect(card.getCountClass()).toBe(COUNT_CLASS);
    });
  });

  // ── getDescriptionText ─────────────────────────────────────────────────

  it("employer cost card has getDescriptionText returning correct string", () => {
    mockStoreState = buildStoreState(sampleWorkforceSection);
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    const employerCard = result.current.overviewCardsConfig[3];
    expect(typeof employerCard.getDescriptionText).toBe("function");
    expect(employerCard.getDescriptionText!()).toBe(
      "The average amount each employee costs the company across benefits"
    );
  });

  it("non-employer-cost cards do not have getDescriptionText", () => {
    mockStoreState = buildStoreState(sampleWorkforceSection);
    const { result } = renderHook(() => useWorkforceOverviewConfig());
    const [totalCard, enrolledCard, avgCostCard] = result.current.overviewCardsConfig;
    expect(totalCard.getDescriptionText).toBeUndefined();
    expect(enrolledCard.getDescriptionText).toBeUndefined();
    expect(avgCostCard.getDescriptionText).toBeUndefined();
  });
});
