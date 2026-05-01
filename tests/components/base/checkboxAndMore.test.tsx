/**
 * Tests for Checkbox (full branch coverage including tooltip), and more checkbox branches
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("react-aria-components", () => ({
  Checkbox: ({ children, className, ...props }: any) => {
    const cls = typeof className === "function" ? className({ isDisabled: false }) : className;
    return (
      <label className={cls} data-testid="aria-checkbox" {...props}>
        {typeof children === "function"
          ? children({
              isSelected: false,
              isIndeterminate: false,
              isDisabled: false,
              isFocusVisible: false,
            })
          : children}
      </label>
    );
  },
  Radio: ({ children, className, value, ...props }: any) => {
    const cls =
      typeof className === "function"
        ? className({ isSelected: false, isDisabled: false, isFocusVisible: false })
        : className;
    return (
      <label className={cls} data-testid="aria-radio" data-value={value} {...props}>
        {typeof children === "function"
          ? children({
              isSelected: false,
              isDisabled: false,
              isFocusVisible: false,
              isHovered: false,
            })
          : children}
      </label>
    );
  },
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="aria-radio-group" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@untitledui/icons", () => ({
  InfoCircle: ({ className }: any) => <span className={className} data-testid="info-circle" />,
}));

vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children, title }: any) => (
    <div data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <button type="button" data-testid="tooltip-trigger">
      {children}
    </button>
  ),
}));

import { Checkbox, CheckboxBase } from "../../../src/components/base/checkbox/checkbox";
import { RadioButton, RadioGroup } from "../../../src/components/base/radio-buttons/radio-buttons";

describe("CheckboxBase", () => {
  it("renders with size sm (default)", () => {
    const { container } = render(<CheckboxBase />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with size md", () => {
    const { container } = render(<CheckboxBase size="md" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders selected state", () => {
    const { container } = render(<CheckboxBase isSelected />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders indeterminate state", () => {
    const { container } = render(<CheckboxBase isIndeterminate />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders disabled state", () => {
    const { container } = render(<CheckboxBase isDisabled />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders selected + indeterminate together", () => {
    const { container } = render(<CheckboxBase isSelected isIndeterminate />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with isFocusVisible", () => {
    const { container } = render(<CheckboxBase isFocusVisible />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders disabled without selected (bg-ws-tertiary branch)", () => {
    const { container } = render(<CheckboxBase isDisabled isSelected={false} />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("Checkbox", () => {
  it("renders with label", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeTruthy();
  });

  it("renders with hint", () => {
    render(<Checkbox hint="This is a hint" />);
    expect(screen.getByText("This is a hint")).toBeTruthy();
  });

  it("renders with label and hint together", () => {
    render(<Checkbox label="Name" hint="Enter full name" />);
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Enter full name")).toBeTruthy();
  });

  it("renders with tooltipText (tooltip branch)", () => {
    render(<Checkbox label="With tooltip" tooltipText="Info here" />);
    expect(screen.getByText("With tooltip")).toBeTruthy();
    expect(screen.getByTestId("tooltip")).toBeTruthy();
    expect(screen.getByTestId("info-circle")).toBeTruthy();
  });

  it("renders without tooltipText (no tooltip branch)", () => {
    render(<Checkbox label="No tooltip" />);
    expect(screen.queryByTestId("tooltip")).toBeNull();
  });

  it("renders with size md", () => {
    render(<Checkbox label="Medium size" size="md" />);
    expect(screen.getByText("Medium size")).toBeTruthy();
  });

  it("renders with size sm (default)", () => {
    render(<Checkbox label="Small size" size="sm" />);
    expect(screen.getByText("Small size")).toBeTruthy();
  });

  it("renders without label or hint (minimal)", () => {
    const { container } = render(<Checkbox />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with label and no hint, no tooltip", () => {
    render(<Checkbox label="Just a label" />);
    expect(screen.getByText("Just a label")).toBeTruthy();
    expect(screen.queryByTestId("info-circle")).toBeNull();
  });
});

describe("RadioButton", () => {
  it("renders with label", () => {
    render(<RadioButton value="a" label="Option A" />);
    expect(screen.getByText("Option A")).toBeTruthy();
  });

  it("renders with hint (covers hint branch)", () => {
    render(<RadioButton value="a" label="Option A" hint="Some hint text" />);
    expect(screen.getByText("Some hint text")).toBeTruthy();
  });

  it("renders with label and hint together", () => {
    render(<RadioButton value="a" label="Label" hint="Hint" />);
    expect(screen.getByText("Label")).toBeTruthy();
    expect(screen.getByText("Hint")).toBeTruthy();
  });

  it("renders without label or hint (minimal)", () => {
    const { container } = render(<RadioButton value="a" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders with size md", () => {
    render(<RadioButton value="a" label="MD" size="md" />);
    expect(screen.getByText("MD")).toBeTruthy();
  });
});

describe("RadioGroup", () => {
  it("renders children", () => {
    render(
      <RadioGroup label="Choose">
        <RadioButton value="a" label="Option A" />
        <RadioButton value="b" label="Option B" />
      </RadioGroup>
    );
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
  });
});
