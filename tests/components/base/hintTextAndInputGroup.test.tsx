import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { HintText } from "../../../src/components/base/input/hint-text";

// Mock react-aria-components Text
vi.mock("react-aria-components", () => ({
  Text: ({ children, slot, className, ...props }: any) => (
    <p className={className} data-slot={slot} {...props}>
      {children}
    </p>
  ),
}));

describe("HintText", () => {
  it("renders children", () => {
    render(<HintText>This is a hint</HintText>);
    expect(screen.getByText("This is a hint")).toBeTruthy();
  });

  it("renders with description slot by default", () => {
    const { container } = render(<HintText>Hint text</HintText>);
    const el = container.querySelector("[data-slot='description']");
    expect(el).toBeTruthy();
  });

  it("renders with errorMessage slot when isInvalid=true", () => {
    const { container } = render(<HintText isInvalid={true}>Error hint</HintText>);
    const el = container.querySelector("[data-slot='errorMessage']");
    expect(el).toBeTruthy();
  });

  it("applies error color class when isInvalid=true", () => {
    const { container } = render(<HintText isInvalid={true}>Error</HintText>);
    const el = container.querySelector("p");
    expect(el?.className).toContain("text-ws-error-600");
  });

  it("applies custom className", () => {
    const { container } = render(<HintText className="custom-class">Custom hint</HintText>);
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });
});
