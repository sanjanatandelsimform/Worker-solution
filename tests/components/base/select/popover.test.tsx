/**
 * Tests for Popover component (popover.tsx)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock react-aria-components AriaPopover to call className function
vi.mock("react-aria-components", () => ({
  Popover: ({ children, className, placement, containerPadding, offset, ...props }: any) => {
    // Call className function with various states to cover branches
    const states = [
      { isEntering: false, isExiting: false },
      { isEntering: true, isExiting: false },
      { isEntering: false, isExiting: true },
    ];
    const cls = typeof className === "function" ? className(states[0]) : className;
    // Also call with entering and exiting to cover those branches
    if (typeof className === "function") {
      className(states[1]); // isEntering = true
      className(states[2]); // isExiting = true
    }
    return (
      <div data-testid="aria-popover" className={cls} data-placement={placement} {...props}>
        {children}
      </div>
    );
  },
}));

vi.mock("@/utils/cx", () => ({
  cx: (...args: any[]) => args.filter(Boolean).join(" "),
}));

import { Popover } from "@/components/base/select/popover";

describe("Popover", () => {
  it("renders with sm size", () => {
    render(
      <Popover size="sm" triggerRef={React.createRef() as any}>
        <div>Content</div>
      </Popover>
    );
    expect(screen.getByText("Content")).toBeTruthy();
    expect(screen.getByTestId("aria-popover")).toBeTruthy();
  });

  it("renders with md size (covers size === md branch)", () => {
    render(
      <Popover size="md" triggerRef={React.createRef() as any}>
        <div>MD Content</div>
      </Popover>
    );
    expect(screen.getByText("MD Content")).toBeTruthy();
  });

  it("renders with string className", () => {
    render(
      <Popover size="sm" triggerRef={React.createRef() as any} className="my-custom-class">
        <div>String class</div>
      </Popover>
    );
    expect(screen.getByText("String class")).toBeTruthy();
  });

  it("renders with function className (covers function className branch)", () => {
    const classnameFn = vi.fn(
      (state: any) => `popover-${state.isEntering ? "entering" : "normal"}`
    );
    render(
      <Popover size="sm" triggerRef={React.createRef() as any} className={classnameFn}>
        <div>Function class</div>
      </Popover>
    );
    expect(screen.getByText("Function class")).toBeTruthy();
    expect(classnameFn).toHaveBeenCalled();
  });
});
