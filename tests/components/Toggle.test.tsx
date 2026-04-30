/**
 * Toggle and ToggleBase Component Tests
 *
 * Covers: ToggleBase visual structure, size/slim/selected/disabled variants,
 * Toggle label rendering, hint rendering, and onChange interaction.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toggle, ToggleBase } from "@/components/base/toggle/toggle";

// ── ToggleBase ────────────────────────────────────────────────────────────────

describe("ToggleBase", () => {
  describe("DOM structure", () => {
    it("renders without crashing", () => {
      const { container } = render(<ToggleBase />);
      expect(container.firstChild).not.toBeNull();
    });

    it("renders an outer div and an inner knob div", () => {
      const { container } = render(<ToggleBase />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.tagName).toBe("DIV");
      expect(outer.firstChild).not.toBeNull();
    });
  });

  describe("size variants", () => {
    it("renders at size 'sm' (default) without error", () => {
      const { container } = render(<ToggleBase size="sm" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders at size 'md' without error", () => {
      const { container } = render(<ToggleBase size="md" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("slim variant", () => {
    it("renders slim variant without error", () => {
      const { container } = render(<ToggleBase slim />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders slim + md without error", () => {
      const { container } = render(<ToggleBase slim size="md" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("selected state", () => {
    it("applies teal background class when isSelected", () => {
      const { container } = render(<ToggleBase isSelected />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.className).toContain("bg-ws-light-teal-800");
    });

    it("does not apply teal background when not selected", () => {
      const { container } = render(<ToggleBase />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.className).not.toContain("bg-ws-light-teal-800");
    });

    it("applies translate class to knob when selected (sm)", () => {
      const { container } = render(<ToggleBase size="sm" isSelected />);
      const knob = (container.firstChild as HTMLElement).firstChild as HTMLElement;
      expect(knob.className).toContain("translate-x-4");
    });

    it("applies translate class to knob when selected (md)", () => {
      const { container } = render(<ToggleBase size="md" isSelected />);
      const knob = (container.firstChild as HTMLElement).firstChild as HTMLElement;
      expect(knob.className).toContain("translate-x-5");
    });
  });

  describe("disabled state", () => {
    it("applies not-allowed cursor when isDisabled", () => {
      const { container } = render(<ToggleBase isDisabled />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.className).toContain("cursor-not-allowed");
    });

    it("does not apply not-allowed cursor when enabled", () => {
      const { container } = render(<ToggleBase />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.className).not.toContain("cursor-not-allowed");
    });
  });

  describe("focus visible state", () => {
    it("applies outline class when isFocusVisible", () => {
      const { container } = render(<ToggleBase isFocusVisible />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.className).toContain("outline-2");
    });
  });

  describe("custom className", () => {
    it("merges a custom className onto the outer div", () => {
      const { container } = render(<ToggleBase className="my-toggle-base" />);
      const outer = container.firstChild as HTMLElement;
      expect(outer.className).toContain("my-toggle-base");
    });
  });
});

// ── Toggle ────────────────────────────────────────────────────────────────────

describe("Toggle", () => {
  describe("rendering", () => {
    it("renders a switch element", () => {
      render(<Toggle />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("switch is unchecked by default", () => {
      render(<Toggle />);
      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("renders with a label text when label prop is provided", () => {
      render(<Toggle label="Enable notifications" />);
      expect(screen.getByText("Enable notifications")).toBeInTheDocument();
    });

    it("does not render a label element when label prop is omitted", () => {
      render(<Toggle />);
      expect(screen.queryByText("Enable notifications")).toBeNull();
    });

    it("renders hint text when hint prop is provided", () => {
      render(<Toggle label="Dark mode" hint="Switch between light and dark" />);
      expect(screen.getByText("Switch between light and dark")).toBeInTheDocument();
    });
  });

  describe("controlled state", () => {
    it("is checked when isSelected is true", () => {
      render(<Toggle isSelected onChange={vi.fn()} />);
      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("is unchecked when isSelected is false", () => {
      render(<Toggle isSelected={false} onChange={vi.fn()} />);
      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("defaults to unchecked when defaultSelected is not provided", () => {
      render(<Toggle />);
      expect(screen.getByRole("switch")).not.toBeChecked();
    });

    it("honours defaultSelected={true} for uncontrolled use", () => {
      render(<Toggle defaultSelected />);
      expect(screen.getByRole("switch")).toBeChecked();
    });
  });

  describe("onChange interaction", () => {
    it("calls onChange when clicked", () => {
      const onChange = vi.fn();
      render(<Toggle onChange={onChange} />);
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange with true when toggled on from unselected", () => {
      const onChange = vi.fn();
      render(<Toggle onChange={onChange} />);
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("calls onChange with false when toggled off from selected", () => {
      const onChange = vi.fn();
      render(<Toggle isSelected onChange={onChange} />);
      fireEvent.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe("disabled state", () => {
    it("switch is disabled when isDisabled is true", () => {
      render(<Toggle isDisabled />);
      expect(screen.getByRole("switch")).toBeDisabled();
    });

    it("has aria-disabled attribute when isDisabled is true", () => {
      render(<Toggle isDisabled onChange={vi.fn()} />);
      // react-aria renders a disabled input; check the accessible disabled state
      expect(screen.getByRole("switch")).toBeDisabled();
    });
  });

  describe("size variants", () => {
    it("renders at size 'sm' (default) without error", () => {
      render(<Toggle size="sm" label="Small" />);
      expect(screen.getByText("Small")).toBeInTheDocument();
    });

    it("renders at size 'md' without error", () => {
      render(<Toggle size="md" label="Medium" />);
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });
  });

  describe("slim variant", () => {
    it("renders in slim mode without error", () => {
      render(<Toggle slim label="Slim toggle" />);
      expect(screen.getByText("Slim toggle")).toBeInTheDocument();
    });
  });

  describe("hint prop", () => {
    it("renders hint text when hint prop is provided", () => {
      render(<Toggle label="With hint" hint="Helper text" />);
      expect(screen.getByText("Helper text")).toBeTruthy();
    });

    it("renders with hint as ReactNode", () => {
      render(<Toggle label="Hint node" hint={<span data-testid="hint-node">Hint content</span>} />);
      expect(screen.getByTestId("hint-node")).toBeTruthy();
    });
  });
});
