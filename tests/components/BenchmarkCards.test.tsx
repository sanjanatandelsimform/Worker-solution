/**
 * StaticCard, CostCard, AverageCard, ProgressCard, TurnoverRateCard — render tests
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock tooltip and icons used by all benchmark cards
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/base/progress-indicators/InlineProgressBar", () => ({
  default: () => <div data-testid="progress-bar" />,
}));

vi.mock("@/components/base/badges/badges", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("@/components/base/progress-indicators/progress-indicators", () => ({
  ProgressBar: () => <div data-testid="progress-bar-component" />,
}));

import StaticCard from "@/pages/recommendations/StaticCard";
import CostCard from "@/pages/benchmark/CostCard";
import AverageCard from "@/pages/benchmark/AverageCard";
import ProgressCard from "@/pages/benchmark/ProgressCard";
import TurnoverRateCard from "@/pages/benchmark/TurnoverRateCard";

// ── StaticCard ──────────────────────────────────────────────────────────
describe("StaticCard", () => {
  it("renders title and count", () => {
    render(<StaticCard title="Turnover Rate" count="22.5%" />);
    expect(screen.getByText("Turnover Rate")).toBeInTheDocument();
    expect(screen.getByText("22.5%")).toBeInTheDocument();
  });

  it("renders with infoIcon=true", () => {
    render(<StaticCard title="Test" count="N/A" infoIcon tooltipText="help" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders with descriptionText (passed to tooltip)", () => {
    render(<StaticCard title="T" descriptionText="Source: BLS" infoIcon={true} />);
    // descriptionText is passed to Tooltip, not rendered as visible text
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders without count", () => {
    render(<StaticCard title="No count card" />);
    expect(screen.getByText("No count card")).toBeInTheDocument();
  });

  it("renders with countIcon", () => {
    render(<StaticCard title="With Icon" count="$5" countIcon={<span data-testid="ic">$</span>} />);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });

  it("renders with all itemAlign variants", () => {
    const { rerender } = render(<StaticCard title="a" itemAlign="start" />);
    rerender(<StaticCard title="a" itemAlign="between" />);
    rerender(<StaticCard title="a" itemAlign="end" />);
  });
});

// ── CostCard ────────────────────────────────────────────────────────────
describe("CostCard", () => {
  it("renders title", () => {
    render(<CostCard title="Cost of Turnover" />);
    expect(screen.getByText("Cost of Turnover")).toBeInTheDocument();
  });

  it("renders with scores", () => {
    render(
      <CostCard
        title="Cost"
        primaryScore="$1.5M"
        secondaryScore="$980K"
        year="2023"
        industryText="Wholesale"
        industryCostText="Industry cost"
        industryTradeText="Trade"
      />
    );
    expect(screen.getByText("$1.5M")).toBeInTheDocument();
    expect(screen.getByText("$980K")).toBeInTheDocument();
  });

  it("renders N/A state when no scores", () => {
    render(<CostCard title="No Data" />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
  });

  it("renders with null primary/secondary values", () => {
    render(<CostCard title="Null" primaryValue={null} secondaryValue={null} />);
    expect(screen.getByText("Null")).toBeInTheDocument();
  });
});

// ── AverageCard ─────────────────────────────────────────────────────────
describe("AverageCard", () => {
  it("renders title and statics", () => {
    render(<AverageCard title="Involuntary" cardStatics="12.5%" />);
    expect(screen.getByText("Involuntary")).toBeInTheDocument();
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("renders with positive staticsPoints and badge", () => {
    render(
      <AverageCard
        title="Hire"
        cardStatics="18%"
        staticsPoints="+3pts"
        staticsPointsState
        progressValue={18}
      />
    );
    expect(screen.getByText("+3pts")).toBeInTheDocument();
  });

  it("renders with negative staticsPoints", () => {
    render(
      <AverageCard
        title="Sep"
        cardStatics="9%"
        staticsPoints="-2pts"
        staticsPointsState
        progressValue={9}
      />
    );
    expect(screen.getByText("-2pts")).toBeInTheDocument();
  });

  it("renders without staticsPoints", () => {
    render(<AverageCard title="T" cardStatics="5%" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders with null progressValue", () => {
    render(<AverageCard title="T" cardStatics="5%" progressValue={null} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders with customBarColor", () => {
    render(
      <AverageCard title="T" cardStatics="5%" progressValue={50} customBarColor="bg-red-500" />
    );
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders with empty staticsPoints string", () => {
    render(<AverageCard title="T" staticsPoints="" staticsPointsState />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});

// ── ProgressCard ────────────────────────────────────────────────────────
describe("ProgressCard", () => {
  it("renders title", () => {
    render(<ProgressCard title="Burdened Owners" tooltipText="Spend 30%+" />);
    expect(screen.getByText("Burdened Owners")).toBeInTheDocument();
  });

  it("renders with sections", () => {
    render(
      <ProgressCard
        title="Burdened"
        tooltipText="tip"
        sections={[
          { items: [{ label: "Metro Area", percentage: 28.5 }], columnsCount: 1 },
          {
            items: [{ label: "Your Employees", percentage: 32.1, progressColor: "bg-navy" }],
            columnsCount: 1,
          },
        ]}
      />
    );
    expect(screen.getByText("Burdened")).toBeInTheDocument();
    expect(screen.getByText("Metro Area")).toBeInTheDocument();
    expect(screen.getByText("Your Employees")).toBeInTheDocument();
  });

  it("renders with legacy single-item props", () => {
    render(
      <ProgressCard
        title="Legacy"
        tooltipText="t"
        percentage={50}
        progressLabel="50%"
        progressColor="bg-blue"
      />
    );
    expect(screen.getByText("Legacy")).toBeInTheDocument();
  });

  it("renders with showInfoIcon", () => {
    render(<ProgressCard title="Info" tooltipText="tip" showInfoIcon />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("renders with empty sections array", () => {
    render(<ProgressCard title="Empty" tooltipText="t" sections={[]} />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });
});

// ── TurnoverRateCard ────────────────────────────────────────────────────
describe("TurnoverRateCard", () => {
  const defaultSections = [
    {
      sectionTitle: "INDUSTRY AVERAGE",
      columnsCount: 2 as const,
      cardsData: [
        { title: "Involuntary", statics: "12.5%", progressValue: 12.5, customBarColor: "bg-teal" },
        { title: "Voluntary", statics: "18.2%", progressValue: 18.2, customBarColor: "bg-navy" },
      ],
    },
  ];

  it("renders title and section title", () => {
    render(
      <TurnoverRateCard
        title="Industry Turnover Rate"
        titleQatar="Q4 2023"
        sections={defaultSections}
        industryBoldText="$4,149.2M"
        sourceText="Source: BLS"
        sourceBoldText="BLS"
        className=""
        sourceClass=""
      />
    );
    expect(screen.getByText("Industry Turnover Rate")).toBeInTheDocument();
    expect(screen.getByText("Q4 2023")).toBeInTheDocument();
    expect(screen.getByText("INDUSTRY AVERAGE")).toBeInTheDocument();
  });

  it("renders with empty sections", () => {
    render(
      <TurnoverRateCard
        title="Empty"
        titleQatar=""
        sections={[]}
        industryBoldText=""
        sourceText=""
        sourceBoldText=""
        className=""
        sourceClass=""
      />
    );
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders multiple sections", () => {
    const sections = [
      ...defaultSections,
      {
        sectionTitle: "YOUR COMPANY",
        columnsCount: 2 as const,
        cardsData: [
          {
            title: "Industry",
            statics: "14%",
            staticsPointsState: true,
            progressValue: 14,
            customBarColor: "bg-teal",
          },
          {
            title: "Company",
            statics: "10%",
            staticsPointsState: true,
            progressValue: 10,
            customBarColor: "bg-navy",
          },
        ],
      },
    ];
    render(
      <TurnoverRateCard
        title="Turnover"
        titleQatar="Q4"
        sections={sections}
        industryBoldText="$4M"
        sourceText=""
        sourceBoldText=""
        className=""
        sourceClass=""
      />
    );
    expect(screen.getByText("YOUR COMPANY")).toBeInTheDocument();
  });
});
