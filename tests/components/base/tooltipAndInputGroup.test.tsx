/**
 * Tests for Tooltip, TooltipTrigger, InputGroup, Checkbox (with tooltip), SelectItem
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock react-aria-components for all tests in this file
vi.mock("react-aria-components", () => ({
  Button: ({ children, className, ...props }: any) => {
    const cls =
      typeof className === "function"
        ? className({ isHovered: false, isPressed: false, isFocusVisible: false })
        : className;
    return (
      <button className={cls} {...props}>
        {children}
      </button>
    );
  },
  TooltipTrigger: ({ children, isDisabled, isOpen, delay, closeDelay, onOpenChange }: any) => (
    <div data-testid="tooltip-trigger" data-disabled={isDisabled} data-open={isOpen}>
      {children}
    </div>
  ),
  Tooltip: ({ children, placement, className, offset, crossOffset, ...props }: any) => {
    const cls =
      typeof className === "function"
        ? className({ isEntering: false, isExiting: false })
        : className;
    return (
      <div data-testid="tooltip" data-placement={placement} className={cls}>
        {typeof children === "function"
          ? children({ isEntering: false, isExiting: false })
          : children}
      </div>
    );
  },
  OverlayArrow: ({ children }: any) => <div data-testid="overlay-arrow">{children}</div>,
  TextField: ({
    children,
    isInvalid,
    isDisabled,
    isRequired,
    "aria-label": ariaLabel,
    ...props
  }: any) => (
    <div data-testid="text-field" data-invalid={isInvalid} data-disabled={isDisabled}>
      {typeof children === "function"
        ? children({ isDisabled: !!isDisabled, isInvalid: !!isInvalid, isRequired: !!isRequired })
        : children}
    </div>
  ),
  Label: ({ children }: any) => <label>{children}</label>,
  Input: (props: any) => <input {...props} />,
  Checkbox: ({ children, className, ...props }: any) => {
    const cls = typeof className === "function" ? className({ isDisabled: false }) : className;
    return (
      <label className={cls} {...props}>
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
  ListBoxItem: ({ children, id, textValue, isDisabled, className, ...props }: any) => {
    const cls =
      typeof className === "function"
        ? className({ isSelected: false, isFocused: false, isFocusVisible: false })
        : className;
    return (
      <li id={id} className={cls} data-testid={`list-item-${id}`} role="option">
        {typeof children === "function"
          ? children({
              isSelected: true,
              isDisabled: false,
              isFocused: false,
              isFocusVisible: false,
            })
          : children}
      </li>
    );
  },
  Text: ({ children, slot, className }: any) => (
    <span data-slot={slot} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/base/input/label", () => ({
  Label: ({ children, isRequired }: any) => (
    <label>
      {children}
      {isRequired && <span>*</span>}
    </label>
  ),
}));

vi.mock("@/components/base/input/hint-text", () => ({
  HintText: ({ children, isInvalid, className }: any) => (
    <p data-invalid={isInvalid} className={className}>
      {children}
    </p>
  ),
}));

vi.mock("@/components/base/input/input", () => ({
  TextField: ({
    children,
    isInvalid,
    isDisabled,
    isRequired,
    "aria-label": ariaLabel,
    inputClassName,
    wrapperClassName,
    tooltipClassName,
    ...props
  }: any) => (
    <div data-testid="text-field" data-invalid={isInvalid}>
      {typeof children === "function"
        ? children({ isDisabled: !!isDisabled, isInvalid: !!isInvalid, isRequired: !!isRequired })
        : children}
    </div>
  ),
}));

vi.mock("@untitledui/icons", () => ({
  InfoCircle: ({ className }: any) => <span className={className} data-testid="info-icon" />,
  Check: ({ className }: any) => <span className={className} data-testid="check-icon" />,
  SearchLg: ({ className }: any) => <span className={className} data-testid="search-icon" />,
}));

vi.mock("@/components/base/avatar/avatar", () => ({
  Avatar: ({ src, alt, size }: any) => <img src={src} alt={alt} data-size={size} />,
}));

vi.mock("@/utils/is-react-component", () => ({
  isReactComponent: (x: any) => typeof x === "function",
}));

// --- Tooltip Tests ---
import { Tooltip, TooltipTrigger } from "../../../src/components/base/tooltip/tooltip";

describe("Tooltip", () => {
  it("renders title only", () => {
    render(
      <Tooltip title="My tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("My tooltip")).toBeTruthy();
  });

  it("renders with description (description branch)", () => {
    render(
      <Tooltip title="Title" description="Some description">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Some description")).toBeTruthy();
  });

  it("renders with arrow (arrow branch)", () => {
    render(
      <Tooltip title="Arrow tooltip" arrow>
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByTestId("overlay-arrow")).toBeTruthy();
  });

  it("renders without arrow (no arrow branch)", () => {
    render(
      <Tooltip title="No arrow">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.queryByTestId("overlay-arrow")).toBeNull();
  });

  it("renders with placement top left (isTopOrBottomLeft branch)", () => {
    render(
      <Tooltip title="Top Left" placement="top left">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Top Left")).toBeTruthy();
  });

  it("renders with placement top end (isTopOrBottomLeft branch)", () => {
    render(
      <Tooltip title="Top End" placement="top end">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Top End")).toBeTruthy();
  });

  it("renders with placement bottom right (isTopOrBottomRight branch)", () => {
    render(
      <Tooltip title="Bottom Right" placement="bottom right">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Bottom Right")).toBeTruthy();
  });

  it("renders with placement top start (isTopOrBottomRight branch)", () => {
    render(
      <Tooltip title="Top Start" placement="top start">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Top Start")).toBeTruthy();
  });

  it("renders with placement right (neither left nor right special case)", () => {
    render(
      <Tooltip title="Right" placement="right">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Right")).toBeTruthy();
  });

  it("renders with default placement (top)", () => {
    render(
      <Tooltip title="Default">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Default")).toBeTruthy();
  });

  it("renders with isDisabled prop", () => {
    render(
      <Tooltip title="Disabled" isDisabled>
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Disabled")).toBeTruthy();
  });

  it("renders isEntering / isExiting state variations", () => {
    // The Tooltip mock calls children as function with isEntering/isExiting
    render(
      <Tooltip title="Enter/Exit">
        <button>Hover</button>
      </Tooltip>
    );
    expect(screen.getByText("Enter/Exit")).toBeTruthy();
  });
});

describe("TooltipTrigger", () => {
  it("renders children", () => {
    render(
      <TooltipTrigger>
        <span>Child content</span>
      </TooltipTrigger>
    );
    expect(screen.getByText("Child content")).toBeTruthy();
  });

  it("renders with custom className", () => {
    render(
      <TooltipTrigger className="custom-class">
        <span>Content</span>
      </TooltipTrigger>
    );
    expect(screen.getByText("Content")).toBeTruthy();
  });
});

// --- InputGroup Tests ---
import { InputGroup, InputPrefix } from "../../../src/components/base/input/input-group";

describe("InputGroup", () => {
  it("renders children inside", () => {
    render(
      <InputGroup>
        <input placeholder="Type here" />
      </InputGroup>
    );
    expect(screen.getByPlaceholderText("Type here")).toBeTruthy();
  });

  it("renders with label", () => {
    render(
      <InputGroup label="My Label">
        <input />
      </InputGroup>
    );
    expect(screen.getByText("My Label")).toBeTruthy();
  });

  it("renders with label + hideRequiredIndicator (isRequired but hide)", () => {
    render(
      <InputGroup label="Hidden Required" hideRequiredIndicator isRequired>
        <input />
      </InputGroup>
    );
    expect(screen.getByText("Hidden Required")).toBeTruthy();
  });

  it("renders with hint text", () => {
    render(
      <InputGroup hint="Some hint">
        <input />
      </InputGroup>
    );
    expect(screen.getByText("Some hint")).toBeTruthy();
  });

  it("renders with leadingAddon", () => {
    render(
      <InputGroup leadingAddon={<span data-testid="leading">+1</span>}>
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId("leading")).toBeTruthy();
  });

  it("renders with trailingAddon", () => {
    render(
      <InputGroup trailingAddon={<span data-testid="trailing">USD</span>}>
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId("trailing")).toBeTruthy();
  });

  it("renders with prefix text", () => {
    render(
      <InputGroup prefix="$">
        <input />
      </InputGroup>
    );
    expect(screen.getByText("$")).toBeTruthy();
  });

  it("renders with sm size", () => {
    render(
      <InputGroup size="sm">
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId("text-field")).toBeTruthy();
  });

  it("renders with md size (default)", () => {
    render(
      <InputGroup size="md">
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId("text-field")).toBeTruthy();
  });

  it("renders with lg size", () => {
    render(
      <InputGroup size="lg">
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId("text-field")).toBeTruthy();
  });

  it("renders with leadingAddon + trailing + prefix combination", () => {
    render(
      <InputGroup
        prefix="$"
        leadingAddon={<span data-testid="leading">+</span>}
        trailingAddon={<span data-testid="trailing">-</span>}
        hint="Hint text"
        label="Both"
      >
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId("leading")).toBeTruthy();
    expect(screen.getByTestId("trailing")).toBeTruthy();
    expect(screen.getByText("Hint text")).toBeTruthy();
  });

  it("renders with isInvalid state", () => {
    render(
      <InputGroup isInvalid hint="Error hint">
        <input />
      </InputGroup>
    );
    expect(screen.getByText("Error hint")).toBeTruthy();
  });
});

describe("InputPrefix", () => {
  it("renders as a span with children", () => {
    render(<InputPrefix>$</InputPrefix>);
    expect(screen.getByText("$")).toBeTruthy();
  });

  it("renders with trailing position", () => {
    render(<InputPrefix position="trailing">USD</InputPrefix>);
    expect(screen.getByText("USD")).toBeTruthy();
  });
});

// --- SelectItem Tests ---
import { SelectItem } from "../../../src/components/base/select/select-item";
import { SelectContext } from "../../../src/components/base/select/select";

function renderWithSelectContext(ui: React.ReactElement) {
  return render(
    <SelectContext.Provider value={{ size: "md" }}>
      <ul role="listbox">{ui}</ul>
    </SelectContext.Provider>
  );
}

describe("SelectItem", () => {
  it("renders with label", () => {
    renderWithSelectContext(<SelectItem id="1" label="Option 1" />);
    expect(screen.getByText("Option 1")).toBeTruthy();
  });

  it("renders with supportingText", () => {
    renderWithSelectContext(<SelectItem id="2" label="Option 2" supportingText="Sub text" />);
    expect(screen.getByText("Sub text")).toBeTruthy();
  });

  it("renders with icon as component (isReactComponent branch)", () => {
    const MyIcon = ({ "data-icon": dataIcon, ...props }: any) => (
      <svg data-testid="my-icon" {...props} />
    );
    renderWithSelectContext(<SelectItem id="3" label="With Icon" icon={MyIcon} />);
    expect(screen.getByTestId("my-icon")).toBeTruthy();
  });

  it("renders with avatarUrl (avatar branch)", () => {
    renderWithSelectContext(
      <SelectItem id="4" label="With Avatar" avatarUrl="https://example.com/avatar.jpg" />
    );
    expect(screen.getByRole("img")).toBeTruthy();
  });

  it("renders check icon when isSelected (via ListBoxItem state)", () => {
    renderWithSelectContext(<SelectItem id="5" label="Selected" />);
    // The mock renders children with isSelected: true
    expect(screen.getByTestId("check-icon")).toBeTruthy();
  });

  it("renders with children string instead of label", () => {
    renderWithSelectContext(<SelectItem id="6">Child text</SelectItem>);
    expect(screen.getByText("Child text")).toBeTruthy();
  });

  it("renders with size sm context", () => {
    render(
      <SelectContext.Provider value={{ size: "sm" }}>
        <ul role="listbox">
          <SelectItem id="7" label="Small" />
        </ul>
      </SelectContext.Provider>
    );
    expect(screen.getByText("Small")).toBeTruthy();
  });
});
