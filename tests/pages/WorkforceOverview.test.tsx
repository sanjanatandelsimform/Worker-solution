/**
 * WorkforceOverview Component Tests
 *
 * Covers: skeleton loading state, card rendering, and the "Did you know?" banner.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkforceOverview from "@/pages/workforce/WorkforceOverview";

// ── Asset mock ───────────────────────────────────────────────────────────────
vi.mock("@/assets/employees-reported.jpg", () => ({ default: "employees-reported.jpg" }));

// ── Child component mocks ────────────────────────────────────────────────────
vi.mock("@/pages/recommendations/StaticCard", () => ({
  default: ({ title, count }: { title: string; count?: string }) => (
    <div data-testid="static-card">
      <span data-testid="card-title">{title}</span>
      {count && <span data-testid="card-count">{count}</span>}
    </div>
  ),
}));

vi.mock("@/pages/workforce/WorkforceSkeletons", () => ({
  OverviewCardSkeleton: () => <div data-testid="overview-card-skeleton" />,
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────
const COUNT_CLASS = "mt-2 text-3xl font-semibold text-ws-text-primary";

const overviewCards = [
  {
    id: "total-workforce",
    title: "Total Workforce",
    count: "3,120",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "enrolled-benefits",
    title: "Enrolled in Benefits",
    count: "2,800",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "avg-employee-cost",
    title: "Avg. Employee Cost Per Pay Period",
    count: "$450",
    getCountClass: () => COUNT_CLASS,
  },
  {
    id: "employer-cost",
    title: "Employer Cost Per Employee",
    count: "$5,400/yr",
    getDescriptionText: () => "The average amount",
    getCountClass: () => COUNT_CLASS,
  },
];

const employeeCards = [
  { id: "emp-1", title: "Full Time Employees", count: "2,500", getCountClass: () => COUNT_CLASS },
  { id: "emp-2", title: "Part Time Employees", count: "400", getCountClass: () => COUNT_CLASS },
  { id: "emp-3", title: "Seasonal Employees", count: "220", getCountClass: () => COUNT_CLASS },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("WorkforceOverview", () => {
  describe("loading state", () => {
    it("renders overview card skeletons when isLoading is true", () => {
      render(
        <WorkforceOverview
          isLoading={true}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      // Overview grid: 4 skeletons + employee grid: 3 skeletons = 7 total
      const skeletons = screen.getAllByTestId("overview-card-skeleton");
      expect(skeletons.length).toBeGreaterThanOrEqual(4);
    });

    it("does not render StaticCard when isLoading is true", () => {
      render(
        <WorkforceOverview
          isLoading={true}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.queryByTestId("static-card")).not.toBeInTheDocument();
    });
  });

  describe("loaded state", () => {
    it("renders overview cards with the correct titles", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      const titles = screen.getAllByTestId("card-title").map(el => el.textContent);
      expect(titles).toContain("Total Workforce");
      expect(titles).toContain("Enrolled in Benefits");
      expect(titles).toContain("Avg. Employee Cost Per Pay Period");
      expect(titles).toContain("Employer Cost Per Employee");
    });

    it("renders employee cards", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      const titles = screen.getAllByTestId("card-title").map(el => el.textContent);
      expect(titles).toContain("Full Time Employees");
      expect(titles).toContain("Part Time Employees");
      expect(titles).toContain("Seasonal Employees");
    });

    it("renders all cards (overview + employee)", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.getAllByTestId("static-card")).toHaveLength(
        overviewCards.length + employeeCards.length
      );
    });

    it("does not render skeletons when loaded", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.queryByTestId("overview-card-skeleton")).not.toBeInTheDocument();
    });
  });

  describe("'Did you know?' banner", () => {
    it("renders the 'Did you know?' heading", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.getByText("Did you know?")).toBeInTheDocument();
    });

    it("renders the banner statistic text", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.getByText("78%")).toBeInTheDocument();
    });

    it("renders the workforce hero image with the correct alt text", () => {
      render(
        <WorkforceOverview
          isLoading={false}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.getByAltText("Workforce hero")).toBeInTheDocument();
    });

    it("also renders the banner while loading", () => {
      render(
        <WorkforceOverview
          isLoading={true}
          overviewCardsConfig={overviewCards}
          employeeCardsConfig={employeeCards}
        />
      );
      expect(screen.getByText("Did you know?")).toBeInTheDocument();
    });
  });

  describe("empty config", () => {
    it("renders without crashing when both card configs are empty", () => {
      render(
        <WorkforceOverview isLoading={false} overviewCardsConfig={[]} employeeCardsConfig={[]} />
      );
      expect(screen.queryByTestId("static-card")).not.toBeInTheDocument();
      expect(screen.getByText("Did you know?")).toBeInTheDocument();
    });
  });
});
