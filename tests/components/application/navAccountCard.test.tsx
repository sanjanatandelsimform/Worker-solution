/**
 * Tests for NavAccountCard and NavAccountMenu
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("react-aria", () => ({
  useFocusManager: vi.fn(() => ({
    focusNext: vi.fn(),
    focusPrevious: vi.fn(),
  })),
}));

vi.mock("react-aria-components", () => ({
  Button: ({ children, className, ...props }: any) => {
    const cls =
      typeof className === "function"
        ? className({ isFocused: false, isPressed: false })
        : className;
    return (
      <button type="button" className={cls} {...props}>
        {children}
      </button>
    );
  },
  Dialog: ({ children, className, ...props }: any) => (
    <div data-testid="dialog" className={className} {...props}>
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
  Popover: ({ children, className, ...props }: any) => {
    const cls =
      typeof className === "function"
        ? className({ isEntering: false, isExiting: false })
        : className;
    return (
      <div data-testid="popover" className={cls} {...props}>
        {children}
      </div>
    );
  },
}));

vi.mock("@/hooks/use-breakpoint", () => ({
  useBreakpoint: vi.fn(() => true),
}));

vi.mock("@/components/base/avatar/avatar-label-group", () => ({
  AvatarLabelGroup: ({ title, subtitle }: any) => (
    <div>
      <span data-testid="avatar-title">{title}</span>
      <span data-testid="avatar-subtitle">{subtitle}</span>
    </div>
  ),
}));

vi.mock("@/components/base/radio-buttons/radio-buttons", () => ({
  RadioButtonBase: ({ isSelected }: any) => (
    <div data-testid="radio-button" data-selected={isSelected} />
  ),
}));

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, iconLeading, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@untitledui/icons", () => ({
  BookOpen01: ({ className }: any) => <svg className={className} data-testid="book-icon" />,
  ChevronSelectorVertical: ({ className }: any) => (
    <svg className={className} data-testid="chevron-icon" />
  ),
  LogOut01: ({ className }: any) => <svg className={className} data-testid="logout-icon" />,
  Plus: ({ className }: any) => <svg className={className} data-testid="plus-icon" />,
  Settings01: ({ className }: any) => <svg className={className} data-testid="settings-icon" />,
  User01: ({ className }: any) => <svg className={className} data-testid="user-icon" />,
}));

import {
  NavAccountCard,
  NavAccountMenu,
} from "@/components/application/app-navigation/base-components/nav-account-card";

describe("NavAccountCard", () => {
  it("renders with default selectedAccountId (olivia)", () => {
    render(<NavAccountCard />);
    const titles = screen.getAllByTestId("avatar-title");
    expect(titles.length).toBeGreaterThan(0);
    // At least one element with Olivia's name should exist
    const oliviaTitles = screen.getAllByText("Olivia Rhye");
    expect(oliviaTitles.length).toBeGreaterThan(0);
  });

  it("renders null for unknown selectedAccountId", () => {
    const { container } = render(<NavAccountCard selectedAccountId="unknown-id-xyz" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with sienna selectedAccountId", () => {
    render(<NavAccountCard selectedAccountId="sienna" />);
    const siennas = screen.getAllByText("Sienna Hewitt");
    expect(siennas.length).toBeGreaterThan(0);
  });

  it("renders popover trigger button", () => {
    render(<NavAccountCard />);
    expect(screen.getByTestId("chevron-icon")).toBeTruthy();
  });

  it("renders with custom popoverPlacement", () => {
    render(<NavAccountCard popoverPlacement="left" />);
    // Should still render without crashing
    expect(screen.getByTestId("chevron-icon")).toBeTruthy();
  });

  it("renders NavAccountMenu inside popover", () => {
    render(<NavAccountCard />);
    expect(screen.getByTestId("dialog")).toBeTruthy();
  });
});

describe("NavAccountMenu", () => {
  it("renders navigation menu items", () => {
    render(<NavAccountMenu />);
    expect(screen.getByText("View profile")).toBeTruthy();
    expect(screen.getByText("Account settings")).toBeTruthy();
    expect(screen.getByText("Documentation")).toBeTruthy();
    expect(screen.getByText("Sign out")).toBeTruthy();
  });

  it("renders shortcut keyboard hints", () => {
    render(<NavAccountMenu />);
    expect(screen.getByText("⌘K->P")).toBeTruthy();
    expect(screen.getByText("⌘S")).toBeTruthy();
    expect(screen.getByText("⌥⇧Q")).toBeTruthy();
  });

  it("renders accounts list with radio buttons", () => {
    render(<NavAccountMenu />);
    const radioButtons = screen.getAllByTestId("radio-button");
    expect(radioButtons.length).toBeGreaterThan(0);
  });

  it("marks selectedAccountId as active in the account list", () => {
    render(<NavAccountMenu selectedAccountId="sienna" />);
    const radioButtons = screen.getAllByTestId("radio-button");
    const selectedButton = radioButtons.find(rb => rb.getAttribute("data-selected") === "true");
    expect(selectedButton).toBeTruthy();
  });

  it("renders Add account button", () => {
    render(<NavAccountMenu />);
    expect(screen.getByText("Add account")).toBeTruthy();
  });

  it("renders switch account section header", () => {
    render(<NavAccountMenu />);
    expect(screen.getByText("Switch account")).toBeTruthy();
  });

  it("renders keyboard accessibility structure", () => {
    render(<NavAccountMenu />);
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toBeTruthy();
    // Verify menu items are accessible buttons
    const buttons = dialog.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
