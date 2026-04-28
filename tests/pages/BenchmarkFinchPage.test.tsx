/**
 * BenchmarkFinchPage Tests - complex rendering tested via selector/hook unit tests
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/hooks/useIndustry", () => ({
  useIndustry: () => ({ data: null, isLoading: false, error: null, isLoaded: true }),
}));

vi.mock(
  "@/pages/benchmark/SalaryHourlyCharts/SalaryHourlyChartsFinch/SalaryHourlyComparisonChart",
  () => ({
    default: () => null,
    SalaryHourlyFinchChart: () => null,
  })
);

vi.mock("@/pages/benchmark/CostBurdenBarChart", () => ({
  IncomeDistributionChart: () => null,
}));

vi.mock("@/assets/icons/Globe", () => ({ GlobeIcon: () => null }));
vi.mock("@/assets/icons/DollarIcon", () => ({ DollarIcon: () => null }));
vi.mock("@/assets/icons/CurrencyStackIcon", () => ({ CurrencyStackIcon: () => null }));
vi.mock("@/assets/icons/TimerIcon", () => ({ TimerIcon: () => null }));

import BenchmarkFinchPage from "@/pages/benchmark/BenchmarkFinchPage";

describe("BenchmarkFinchPage", () => {
  it("exists and exports default component", () => {
    expect(BenchmarkFinchPage).toBeDefined();
  });
});
