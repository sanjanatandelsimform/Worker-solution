/**
 * Dropdown Component Tests
 *
 * Covers: DotsButton rendering, Item label and children, Separator, Sections,
 * and full open/close interaction via MenuTrigger.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Dropdown } from "@/components/base/dropdown/dropdown";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Renders a complete Dropdown (trigger + popover + menu) so that interaction
 * tests can open the menu and inspect its items.
 */
const renderDropdown = (extraMenuProps = {}) =>
  render(
    <Dropdown.Root>
      <Dropdown.DotsButton />
      <Dropdown.Popover>
        <Dropdown.Menu {...extraMenuProps}>
          <Dropdown.Item label="Edit">Edit</Dropdown.Item>
          <Dropdown.Item label="Copy link">Copy link</Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item label="Delete">Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );

const openDropdown = async () => {
  const trigger = screen.getByRole("button", { name: "Open menu" });
  await act(async () => {
    fireEvent.click(trigger);
  });
};

// ── Dropdown.DotsButton ───────────────────────────────────────────────────────

describe("Dropdown.DotsButton", () => {
  it("renders as a <button>", () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
      </Dropdown.Root>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has aria-label 'Open menu'", () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
      </Dropdown.Root>
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("renders a visible button element (icon is globally mocked)", () => {
    // @untitledui/icons is globally mocked to return null components;
    // verify the accessible button element is still present.
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
      </Dropdown.Root>
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("accepts and applies a custom className", () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton className="custom-cls" />
      </Dropdown.Root>
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveClass("custom-cls");
  });
});

// ── Dropdown open / close interaction ─────────────────────────────────────────

describe("Dropdown open/close", () => {
  it("menu items are not visible before the trigger is clicked", () => {
    renderDropdown();
    expect(screen.queryByRole("menuitem", { name: "Edit" })).toBeNull();
  });

  it("shows menu items after clicking the DotsButton", async () => {
    renderDropdown();
    await openDropdown();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders a separator between sections", async () => {
    renderDropdown();
    await openDropdown();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});

// ── Dropdown.Item ─────────────────────────────────────────────────────────────

describe("Dropdown.Item", () => {
  it("renders label text when open", async () => {
    renderDropdown();
    await openDropdown();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("fires onAction callback when an item is selected", async () => {
    const onAction = vi.fn();
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
          <Dropdown.Menu onAction={onAction}>
            <Dropdown.Item id="rename" label="Rename">
              Rename
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    );
    await openDropdown();
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    });
    expect(onAction).toHaveBeenCalledWith("rename");
  });

  it("renders with an icon", async () => {
    const TestIcon = ({ className }: { className?: string }) => (
      <svg data-testid="item-icon" className={className} />
    );
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item label="Archive" icon={TestIcon}>
              Archive
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    );
    await openDropdown();
    expect(screen.getByTestId("item-icon")).toBeInTheDocument();
  });

  it("renders children instead of label when children is a string", async () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item>Custom child text</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    );
    await openDropdown();
    expect(screen.getByText("Custom child text")).toBeInTheDocument();
  });

  it("renders a disabled item without throwing", async () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
          <Dropdown.Menu disabledKeys={["del"]}>
            <Dropdown.Item id="del" label="Delete">
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    );
    await openDropdown();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
  });
});

// ── Dropdown.Separator ────────────────────────────────────────────────────────

describe("Dropdown.Separator", () => {
  it("renders a separator element when dropdown is open", async () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item label="Top">Top</Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item label="Bottom">Bottom</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    );
    await openDropdown();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});

// ── Dropdown.Section ──────────────────────────────────────────────────────────

describe("Dropdown.Section", () => {
  it("renders section items when dropdown is open", async () => {
    render(
      <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Section>
              <Dropdown.SectionHeader>Actions</Dropdown.SectionHeader>
              <Dropdown.Item label="Move">Move</Dropdown.Item>
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>
    );
    await openDropdown();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Move" })).toBeInTheDocument();
  });
});

// ── Dropdown selection modes ───────────────────────────────────────────────────

describe("Dropdown selection indicators", () => {
  const indicators = ["checkmark", "checkbox", "radio", "toggle", "none"] as const;

  indicators.forEach(indicator => {
    it(`renders items with selectionIndicator='${indicator}' without error`, async () => {
      render(
        <Dropdown.Root>
          <Dropdown.DotsButton />
          <Dropdown.Popover>
            <Dropdown.Menu selectionMode="single">
              <Dropdown.Item label="Option A" selectionIndicator={indicator}>
                Option A
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      );
      await openDropdown();
      expect(screen.getByRole("menuitemradio", { name: "Option A" })).toBeInTheDocument();
    });
  });
});
