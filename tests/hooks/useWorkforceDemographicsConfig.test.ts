/**
 * useWorkforceDemographicsConfig Hook Tests
 *
 * Covers: null/fallback state, departmentItems mapping, demographicsCardsConfig,
 * donutChartsConfig (department selection + fallback), and ageBreakdownConfig
 * (employment type switching + AGE_COLORS cycling).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Demographics } from "@/types/workforceTypes";
import { useWorkforceDemographicsConfig } from "@/hooks/useWorkforceDemographicsConfig";

// ── Shared mutable mock state ──────────────────────────────────────────────

let mockStoreState: object = { workforce: { data: null } };

vi.mock("@/store/hooks", () => ({
  useAppSelector: (selector: (state: object) => unknown) => selector(mockStoreState),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function buildStoreState(demographics: Demographics | null) {
  if (demographics === null) {
    return { workforce: { data: null } };
  }
  return {
    workforce: {
      data: {
        assessmentType: "finch",
        workforce: {
          dataStatus: "complete",
          workforce: null,
          participation: null,
          demographics,
          compensation: null,
        },
      },
    },
  };
}

const sampleDemographics: Demographics = {
  employmentType: [
    { department: "all", fullTime: "80%", partTime: "15%", other: "5%" },
    { department: "engineering", fullTime: "90%", partTime: "8%", other: "2%" },
    { department: "sales", fullTime: "70%", partTime: "25%", other: "5%" },
  ],
  gender: { men: "55%", women: "40%", other: "5%" },
  employmentBreakdownByAge: [
    { ageGroup: "> 30", fullTime: 100, partTime: 20, other: 5 },
    { ageGroup: "30 - 40", fullTime: 80, partTime: 15, other: 3 },
    { ageGroup: "40 - 50", fullTime: 60, partTime: 10, other: 2 },
    { ageGroup: "50 - 60", fullTime: 40, partTime: 8, other: 1 },
    { ageGroup: "60+", fullTime: 20, partTime: 4, other: 0 },
    { ageGroup: "70+", fullTime: 10, partTime: 2, other: 0 }, // > 5 entries to test color cycling
  ],
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useWorkforceDemographicsConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = buildStoreState(null);
  });

  // ── Null / fallback state ───────────────────────────────────────────────

  it("returns empty arrays when demographicsSection is null", () => {
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    expect(result.current.departmentItems).toEqual([]);
    expect(result.current.demographicsCardsConfig).toHaveLength(3);
    result.current.demographicsCardsConfig.forEach(card => {
      expect(card.count).toBe("--");
    });
    expect(result.current.donutChartsConfig).toEqual([]);
    expect(result.current.ageBreakdownConfig).toEqual([]);
  });

  // ── departmentItems ────────────────────────────────────────────────────

  it("maps 'all' department to label 'All'", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const allItem = result.current.departmentItems.find(d => d.id === "all");
    expect(allItem).toBeDefined();
    expect(allItem!.label).toBe("All");
  });

  it("capitalizes first letter of non-all department names", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const engItem = result.current.departmentItems.find(d => d.id === "engineering");
    expect(engItem).toBeDefined();
    expect(engItem!.label).toBe("Engineering");

    const salesItem = result.current.departmentItems.find(d => d.id === "sales");
    expect(salesItem!.label).toBe("Sales");
  });

  it("departmentItems length matches employmentType entries", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    expect(result.current.departmentItems).toHaveLength(3);
  });

  // ── demographicsCardsConfig ────────────────────────────────────────────

  it("demographicsCardsConfig has correct ids and titles", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [women, men, other] = result.current.demographicsCardsConfig;
    expect(women.id).toBe("women");
    expect(women.title).toBe("Women");
    expect(men.id).toBe("men");
    expect(men.title).toBe("Men");
    expect(other.id).toBe("other");
    expect(other.title).toBe("Other");
  });

  it("demographicsCardsConfig shows gender percentages from data", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [women, men, other] = result.current.demographicsCardsConfig;
    expect(women.count).toBe("40%");
    expect(men.count).toBe("55%");
    expect(other.count).toBe("5%");
  });

  it("other card has correct tooltip text", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [, , other] = result.current.demographicsCardsConfig;
    expect(other.tooltipText).toBe(
      "Other includes individuals that choose not to identify or do not identify as man or woman."
    );
  });

  it("women and men cards have no tooltipText", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [women, men] = result.current.demographicsCardsConfig;
    expect(women.tooltipText).toBeUndefined();
    expect(men.tooltipText).toBeUndefined();
  });

  it("other card shows '--' fallback when gender.other is absent", () => {
    const demographicsWithoutOther: Demographics = {
      ...sampleDemographics,
      gender: { men: "55%", women: "40%" },
    };
    mockStoreState = buildStoreState(demographicsWithoutOther);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [, , other] = result.current.demographicsCardsConfig;
    expect(other.count).toBe("--");
  });

  it("getCountClass returns the correct CSS class string", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    result.current.demographicsCardsConfig.forEach(card => {
      expect(card.getCountClass()).toBe("mt-2 text-3xl font-semibold text-ws-text-primary");
    });
  });

  // ── donutChartsConfig ──────────────────────────────────────────────────

  it("donutChartsConfig has 3 entries (full-time, part-time, other) for selected dept", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    expect(result.current.donutChartsConfig).toHaveLength(3);
  });

  it("donutChartsConfig parses percentages for 'all' department", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [ft, pt, other] = result.current.donutChartsConfig;
    expect(ft.id).toBe("full-time");
    expect(ft.percentage).toBe(80); // "80%" → 80
    expect(pt.id).toBe("part-time");
    expect(pt.percentage).toBe(15); // "15%" → 15
    expect(other.id).toBe("other");
    expect(other.percentage).toBe(5); // "5%" → 5
  });

  it("donutChartsConfig selects the matching department by selectedDepartment", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("engineering", "fullTime"));
    const [ft] = result.current.donutChartsConfig;
    expect(ft.percentage).toBe(90); // engineering: "90%"
  });

  it("donutChartsConfig falls back to the first department when selectedDepartment not found", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() =>
      useWorkforceDemographicsConfig("nonexistent-dept", "fullTime")
    );
    // Falls back to first entry ("all" → 80%)
    expect(result.current.donutChartsConfig[0].percentage).toBe(80);
  });

  it("donutChartsConfig entries have correct color classes and labels", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const [ft, pt, other] = result.current.donutChartsConfig;
    expect(ft.label).toBe("Full Time");
    expect(ft.progressColor).toBe("color-ws-progress-primary");
    expect(pt.label).toBe("Part Time");
    expect(pt.progressColor).toBe("color-ws-progress-secondary");
    expect(other.label).toBe("Other");
    expect(other.progressColor).toBe("color-ws-progress-turnery");
  });

  // ── ageBreakdownConfig ─────────────────────────────────────────────────

  it("ageBreakdownConfig maps age groups with correct labels", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const config = result.current.ageBreakdownConfig;
    expect(config[0].label).toBe("Age: > 30");
    expect(config[1].label).toBe("Age: 30 - 40");
  });

  it("ageBreakdownConfig uses fullTime values when selectedEmploymentType='fullTime'", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const config = result.current.ageBreakdownConfig;
    expect(config[0].value).toBe(100); // > 30 fullTime
    expect(config[1].value).toBe(80); // 30-40 fullTime
  });

  it("ageBreakdownConfig uses partTime values when selectedEmploymentType='partTime'", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "partTime"));
    const config = result.current.ageBreakdownConfig;
    expect(config[0].value).toBe(20); // > 30 partTime
    expect(config[1].value).toBe(15); // 30-40 partTime
  });

  it("ageBreakdownConfig uses other values when selectedEmploymentType='other'", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "other"));
    const config = result.current.ageBreakdownConfig;
    expect(config[0].value).toBe(5); // > 30 other
    expect(config[4].value).toBe(0); // 60+ other
  });

  it("ageBreakdownConfig assigns AGE_COLORS with modulo cycling for >5 entries", () => {
    mockStoreState = buildStoreState(sampleDemographics); // has 6 age entries
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    const config = result.current.ageBreakdownConfig;
    expect(config).toHaveLength(6);

    // Index 5 (6th entry) should cycle back to AGE_COLORS[0]
    const color5 = config[5].customColor;
    const color0 = config[0].customColor;
    // Both should have the same base color (index 5 % 5 = 0)
    const getBaseColor = (s: string) => s.replace(" rounded-none", "");
    expect(getBaseColor(color5)).toBe(getBaseColor(color0));
  });

  it("ageBreakdownConfig entries all have 'rounded-none' suffix in customColor", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    result.current.ageBreakdownConfig.forEach(entry => {
      expect(entry.customColor).toContain("rounded-none");
    });
  });

  it("ageBreakdownConfig generates stable id per index", () => {
    mockStoreState = buildStoreState(sampleDemographics);
    const { result } = renderHook(() => useWorkforceDemographicsConfig("all", "fullTime"));
    result.current.ageBreakdownConfig.forEach((entry, i) => {
      expect(entry.id).toBe(`age-${i}`);
    });
  });
});
