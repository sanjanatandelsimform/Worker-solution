/**
 * WorkforceParticipation Component Tests
 *
 * Covers: skeleton state, heading, participation cards, and progress sections.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkforceParticipation from "@/pages/workforce/WorkforceParticipation";

// ── Child component mocks ────────────────────────────────────────────────────
vi.mock("@/pages/recommendations/StaticCard", () => ({
  default: ({ title, count }: { title: string; count?: string }) => (
    <div data-testid="static-card">
      <span data-testid="card-title">{title}</span>
      {count && <span data-testid="card-count">{count}</span>}
    </div>
  ),
}));

vi.mock("@/pages/benchmark/ProgressCard", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="progress-card">
      <span data-testid="progress-title">{title}</span>
    </div>
  ),
}));

vi.mock("@/pages/workforce/WorkforceSkeletons", () => ({
  WagesCardSkeleton: () => <div data-testid="wages-card-skeleton" />,
  ProgressCardSkeleton: () => <div data-testid="progress-card-skeleton" />,
  ProgressCardSkeletonOne: () => <div data-testid="progress-card-skeleton-one" />,
  ProgressCardSkeletonFour: () => <div data-testid="progress-card-skeleton-four" />,
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────
const participationCards = [
  { id: "enrolled-benefits", title: "Enrolled in Benefits", count: "2,800", countIcon: null },
  { id: "enrolled-retirement", title: "Enrolled in Retirement", count: "2,340", countIcon: null },
  { id: "enrolled-health", title: "Enrolled in Health", count: "2,780", countIcon: null },
];

const benefitsItems = [
  { label: "FSA", percentage: 64 },
  { label: "HSA", percentage: 45 },
];

const retirementItems = [{ label: "401k", percentage: 75 }];

const insuranceItems = [
  { label: "Health", percentage: 89 },
  { label: "Dental", percentage: 72 },
  { label: "Vision", percentage: 68 },
  { label: "Life", percentage: 55 },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("WorkforceParticipation", () => {
  describe("loading state", () => {
    it("renders wage card skeletons when isLoading is true", () => {
      render(
        <WorkforceParticipation
          isLoading={true}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.getAllByTestId("wages-card-skeleton").length).toBeGreaterThanOrEqual(1);
    });

    it("renders progress card skeletons when isLoading is true", () => {
      render(
        <WorkforceParticipation
          isLoading={true}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.getByTestId("progress-card-skeleton")).toBeInTheDocument();
      expect(screen.getByTestId("progress-card-skeleton-one")).toBeInTheDocument();
      expect(screen.getByTestId("progress-card-skeleton-four")).toBeInTheDocument();
    });

    it("does not render StaticCard or ProgressCard when loading", () => {
      render(
        <WorkforceParticipation
          isLoading={true}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.queryByTestId("static-card")).not.toBeInTheDocument();
      expect(screen.queryByTestId("progress-card")).not.toBeInTheDocument();
    });
  });

  describe("loaded state", () => {
    it("renders the Participation Breakdown heading", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.getByText("Participation Breakdown")).toBeInTheDocument();
    });

    it("renders all participation cards", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.getAllByTestId("static-card")).toHaveLength(participationCards.length);
    });

    it("renders participation card titles", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      const titles = screen.getAllByTestId("card-title").map(el => el.textContent);
      expect(titles).toContain("Enrolled in Benefits");
      expect(titles).toContain("Enrolled in Retirement");
      expect(titles).toContain("Enrolled in Health");
    });

    it("renders Benefits, Retirement, and Insurance progress sections", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      const progressTitles = screen.getAllByTestId("progress-title").map(el => el.textContent);
      expect(progressTitles).toContain("Benefits");
      expect(progressTitles).toContain("Retirement");
      expect(progressTitles).toContain("Insurance");
    });

    it("renders three ProgressCard components", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.getAllByTestId("progress-card")).toHaveLength(3);
    });

    it("does not render skeletons when loaded", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={participationCards}
          benefitsItems={benefitsItems}
          retirementItems={retirementItems}
          insuranceItems={insuranceItems}
        />
      );
      expect(screen.queryByTestId("wages-card-skeleton")).not.toBeInTheDocument();
      expect(screen.queryByTestId("progress-card-skeleton")).not.toBeInTheDocument();
    });
  });

  describe("empty config", () => {
    it("renders without crashing when config arrays are empty", () => {
      render(
        <WorkforceParticipation
          isLoading={false}
          participationCardsConfig={[]}
          benefitsItems={[]}
          retirementItems={[]}
          insuranceItems={[]}
        />
      );
      expect(screen.getByText("Participation Breakdown")).toBeInTheDocument();
      expect(screen.queryByTestId("static-card")).not.toBeInTheDocument();
    });
  });
});
