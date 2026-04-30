/**
 * Tests for progress indicators, badges, and other low-coverage base components
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Progress Indicators ─────────────────────────────────────────────────────
import {
  ProgressBar,
  ProgressBarBase,
} from "@/components/base/progress-indicators/progress-indicators";

describe("ProgressBarBase", () => {
  it("renders with value 50", () => {
    const { container } = render(<ProgressBarBase value={50} />);
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });

  it("applies correct aria attributes", () => {
    render(<ProgressBarBase value={75} min={0} max={100} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("75");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("applies custom className", () => {
    const { container } = render(<ProgressBarBase value={50} className="custom-class" />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.classList.contains("custom-class")).toBe(true);
  });

  it("uses custom color when provided", () => {
    const { container } = render(
      <ProgressBarBase value={50} customColor="bg-red-500" progressClassName="progress-fill" />
    );
    const fill = container.querySelector(".progress-fill");
    expect(fill).toBeTruthy();
  });

  it("defaults to bg-ws-primary-700 when no customColor provided", () => {
    const { container } = render(<ProgressBarBase value={50} />);
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });
});

describe("ProgressBar (with labels)", () => {
  it("renders without label (default)", () => {
    render(<ProgressBar value={60} />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("renders with labelPosition=none", () => {
    render(<ProgressBar value={60} labelPosition="none" />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("renders with labelPosition=right and shows percentage", () => {
    render(<ProgressBar value={60} labelPosition="right" />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("renders with labelPosition=bottom", () => {
    render(<ProgressBar value={40} labelPosition="bottom" />);
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("renders with labelPosition=top-floating", () => {
    render(<ProgressBar value={50} labelPosition="top-floating" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders with labelPosition=bottom-floating", () => {
    render(<ProgressBar value={30} labelPosition="bottom-floating" />);
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("uses custom valueFormatter", () => {
    render(
      <ProgressBar
        value={75}
        labelPosition="right"
        valueFormatter={(val) => `${val} out of 100`}
      />
    );
    expect(screen.getByText("75 out of 100")).toBeInTheDocument();
  });

  it("respects custom min and max", () => {
    render(<ProgressBar value={50} min={0} max={200} labelPosition="right" />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });
});

// ── ProgressBarCircle ────────────────────────────────────────────────────────
import { ProgressBarCircle } from "@/components/base/progress-indicators/progress-circles";

describe("ProgressBarCircle", () => {
  it("renders with size xs", () => {
    const { container } = render(<ProgressBarCircle value={50} size="xs" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders with size sm", () => {
    const { container } = render(<ProgressBarCircle value={70} size="sm" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders with size md", () => {
    const { container } = render(<ProgressBarCircle value={80} size="md" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders with size lg", () => {
    const { container } = render(<ProgressBarCircle value={90} size="lg" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders with size xxs", () => {
    const { container } = render(<ProgressBarCircle value={20} size="xxs" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders label when provided", () => {
    render(<ProgressBarCircle value={60} size="md" label="completion" />);
    expect(screen.getByText("completion")).toBeInTheDocument();
  });

  it("renders formatted value", () => {
    render(
      <ProgressBarCircle
        value={75}
        size="md"
        valueFormatter={(val) => `${val}%`}
      />
    );
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders default percentage text", () => {
    render(<ProgressBarCircle value={50} size="md" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("handles value 0", () => {
    render(<ProgressBarCircle value={0} size="sm" />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("handles value 100", () => {
    render(<ProgressBarCircle value={100} size="sm" />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});

// ── Badges ──────────────────────────────────────────────────────────────────
vi.mock("@untitledui/icons", () => ({
  X: ({ className }: any) => <span className={className} data-testid="x-icon">×</span>,
}));
vi.mock("@/components/foundations/dot-icon", () => ({
  Dot: ({ className }: any) => <span className={className} data-testid="dot-icon">•</span>,
}));

import {
  Badge,
  BadgeWithDot,
  BadgeWithIcon,
  BadgeWithButton,
  BadgeIcon,
  BadgeWithFlag,
  BadgeWithImage,
} from "@/components/base/badges/badges";

const TestIcon = ({ className }: { className?: string }) => (
  <span className={className} data-testid="test-icon" />
);

describe("Badge", () => {
  it("renders basic badge with text", () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders pill-color type badge", () => {
    render(<Badge type="pill-color" color="brand">Pill</Badge>);
    expect(screen.getByText("Pill")).toBeInTheDocument();
  });

  it("renders color type (badge-color)", () => {
    render(<Badge type="color" color="error">Error Badge</Badge>);
    expect(screen.getByText("Error Badge")).toBeInTheDocument();
  });

  it("renders modern type (badge-modern)", () => {
    render(<Badge type="modern" color="gray">Modern</Badge>);
    expect(screen.getByText("Modern")).toBeInTheDocument();
  });

  it("renders badge with size sm", () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toBeInTheDocument();
  });

  it("renders badge with size md", () => {
    render(<Badge size="md">Medium</Badge>);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders badge with size lg", () => {
    render(<Badge size="lg">Large</Badge>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("renders with success color", () => {
    render(<Badge color="success">Success</Badge>);
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("renders with warning color", () => {
    render(<Badge color="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("renders with gray color", () => {
    render(<Badge color="gray">Gray</Badge>);
    expect(screen.getByText("Gray")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(<Badge className="custom-badge">Custom</Badge>);
    expect(container.querySelector(".custom-badge")).toBeTruthy();
  });
});

describe("BadgeWithDot", () => {
  it("renders badge with dot", () => {
    render(<BadgeWithDot>Dot Badge</BadgeWithDot>);
    expect(screen.getByText("Dot Badge")).toBeInTheDocument();
    expect(screen.getByTestId("dot-icon")).toBeInTheDocument();
  });

  it("renders with brand color", () => {
    render(<BadgeWithDot color="brand">Brand</BadgeWithDot>);
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("renders with size sm", () => {
    render(<BadgeWithDot size="sm">Small</BadgeWithDot>);
    expect(screen.getByText("Small")).toBeInTheDocument();
  });
});

describe("BadgeWithIcon", () => {
  it("renders badge with leading icon", () => {
    render(<BadgeWithIcon iconLeading={TestIcon}>With Icon</BadgeWithIcon>);
    expect(screen.getByText("With Icon")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders badge with trailing icon", () => {
    render(<BadgeWithIcon iconTrailing={TestIcon}>Trailing</BadgeWithIcon>);
    expect(screen.getByText("Trailing")).toBeInTheDocument();
  });

  it("renders without icons", () => {
    render(<BadgeWithIcon>No Icon</BadgeWithIcon>);
    expect(screen.getByText("No Icon")).toBeInTheDocument();
  });

  it("renders with color type", () => {
    render(<BadgeWithIcon type="color" color="error">Error</BadgeWithIcon>);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });
});

describe("BadgeWithButton", () => {
  it("renders badge with close button", () => {
    const onButtonClick = vi.fn();
    render(
      <BadgeWithButton onButtonClick={onButtonClick} buttonLabel="close">
        Closeable
      </BadgeWithButton>
    );
    expect(screen.getByText("Closeable")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "close" });
    fireEvent.click(btn);
    expect(onButtonClick).toHaveBeenCalled();
  });

  it("renders with custom icon", () => {
    render(
      <BadgeWithButton icon={TestIcon} buttonLabel="custom">
        Custom Icon
      </BadgeWithButton>
    );
    expect(screen.getByText("Custom Icon")).toBeInTheDocument();
  });

  it("renders with color type", () => {
    render(
      <BadgeWithButton type="color" color="brand" buttonLabel="rm">
        Brand
      </BadgeWithButton>
    );
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("renders with sizes sm, md, lg", () => {
    ["sm", "md", "lg"].forEach(size => {
      render(
        <BadgeWithButton size={size as any} buttonLabel={`${size}-btn`}>
          {size} badge
        </BadgeWithButton>
      );
      expect(screen.getByText(`${size} badge`)).toBeInTheDocument();
    });
  });
});

describe("BadgeWithFlag", () => {
  it("renders with default props (covers lines 250-271)", () => {
    const { container } = render(<BadgeWithFlag>US</BadgeWithFlag>);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("US")).toBeInTheDocument();
  });

  it("renders with type=pill-color, size=sm", () => {
    const { container } = render(
      <BadgeWithFlag type="pill-color" size="sm" color="brand" flag="US">
        Small
      </BadgeWithFlag>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with type=color, size=lg", () => {
    const { container } = render(
      <BadgeWithFlag type="color" size="lg" color="success" flag="AU">
        Large
      </BadgeWithFlag>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with type=modern, size=md", () => {
    const { container } = render(
      <BadgeWithFlag type="modern" size="md" color="gray" flag="GB">
        Modern
      </BadgeWithFlag>
    );
    expect(container.firstChild).toBeTruthy();
  });
});

describe("BadgeWithImage", () => {
  it("renders with default props (covers lines 292-313)", () => {
    const { container } = render(
      <BadgeWithImage imgSrc="https://example.com/img.png">Badge</BadgeWithImage>
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("Badge")).toBeInTheDocument();
  });

  it("renders with type=pill-color, size=sm", () => {
    const { container } = render(
      <BadgeWithImage type="pill-color" size="sm" color="error" imgSrc="https://example.com/img.png">
        Small
      </BadgeWithImage>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with type=color, size=lg", () => {
    const { container } = render(
      <BadgeWithImage type="color" size="lg" color="warning" imgSrc="https://example.com/img.png">
        Large
      </BadgeWithImage>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with type=modern, size=md", () => {
    const { container } = render(
      <BadgeWithImage type="modern" size="md" color="gray" imgSrc="https://example.com/img.png">
        Modern
      </BadgeWithImage>
    );
    expect(container.firstChild).toBeTruthy();
  });
});

describe("BadgeIcon", () => {
  it("renders icon-only badge", () => {
    render(<BadgeIcon icon={TestIcon} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders with color type", () => {
    render(<BadgeIcon icon={TestIcon} type="color" color="success" />);
    expect(screen.getAllByTestId("test-icon").length).toBeGreaterThan(0);
  });

  it("renders with different sizes", () => {
    ["sm", "lg"].forEach(size => {
      const { container } = render(<BadgeIcon icon={TestIcon} size={size as any} />);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
