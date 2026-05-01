import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { NavItemBase } from "../../../src/components/application/app-navigation/base-components/nav-item";
import { NavList } from "../../../src/components/application/app-navigation/base-components/nav-list";
import { NavItemButton } from "../../../src/components/application/app-navigation/base-components/nav-item-button";
import {
  FeaturedCardProgressBar,
  FeaturedCardProgressCircle,
} from "../../../src/components/application/app-navigation/base-components/featured-cards";
import { MobileNavigationHeader } from "../../../src/components/application/app-navigation/base-components/mobile-header";

// Mock react-aria-components
vi.mock("react-aria-components", () => ({
  Link: ({ children, href, className, onClick, "aria-current": ariaCurrent, ...props }: any) => (
    <a href={href} className={className} onClick={onClick} aria-current={ariaCurrent} {...props}>
      {children}
    </a>
  ),
  Button: ({ children, onClick, "aria-label": ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  Modal: ({ children }: any) => <div>{children}</div>,
  ModalOverlay: ({ children }: any) => (
    <div>{typeof children === "function" ? children({ state: { close: vi.fn() } }) : children}</div>
  ),
  Pressable: ({ children }: any) => <div>{children}</div>,
}));

// Mock @untitledui/icons
vi.mock("@untitledui/icons", () => ({
  ChevronDown: ({ className }: any) => <span className={className} data-testid="chevron-down" />,
  Share04: ({ className }: any) => <span className={className} data-testid="share-icon" />,
  X: ({ className }: any) => <span className={className} data-testid="x-icon" />,
  Menu02: ({ className }: any) => <span className={className} data-testid="menu-icon" />,
}));

// Mock Badge
vi.mock("@/components/base/badges/badges", () => ({
  Badge: ({ children, color, type, size, className }: any) => (
    <span className={className} data-testid="nav-badge">
      {children}
    </span>
  ),
}));

// Mock Tooltip
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
}));

// Mock foundation components
vi.mock("@/components/foundations/logo/untitledui-logo", () => ({
  UntitledLogo: () => <div data-testid="logo" />,
}));

// Mock Button
vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick, "aria-label": ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

// Mock CloseButton
vi.mock("@/components/base/buttons/close-button", () => ({
  CloseButton: ({ onClick, size }: any) => (
    <button onClick={onClick} data-testid="close-button" aria-label="close">
      ×
    </button>
  ),
}));

// Mock ProgressBar and ProgressBarCircle
vi.mock("@/components/base/progress-indicators/progress-indicators", () => ({
  ProgressBar: ({ value }: any) => (
    <div data-testid="progress-bar" data-value={value}>
      ProgressBar
    </div>
  ),
}));

vi.mock("@/components/base/progress-indicators/progress-circles", () => ({
  ProgressBarCircle: ({ value }: any) => (
    <div data-testid="progress-circle" data-value={value}>
      ProgressCircle
    </div>
  ),
}));

const MockIcon = ({ className }: any) => (
  <svg className={className} data-testid="nav-icon" viewBox="0 0 24 24" />
);

describe("NavItemBase", () => {
  it("renders a link type nav item", () => {
    render(
      <NavItemBase type="link" href="/home" icon={MockIcon}>
        Home
      </NavItemBase>
    );
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByRole("link")).toBeTruthy();
  });

  it("renders a current link with current style", () => {
    render(
      <NavItemBase type="link" href="/home" current={true}>
        Home
      </NavItemBase>
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("renders a collapsible type nav item", () => {
    render(
      <NavItemBase type="collapsible" icon={MockIcon} onClick={vi.fn()}>
        Settings
      </NavItemBase>
    );
    // collapsible renders as summary element
    expect(screen.getByTestId("chevron-down")).toBeTruthy();
  });

  it("renders a collapsible-child type nav item", () => {
    render(
      <NavItemBase type="collapsible-child" href="/settings/profile">
        Profile
      </NavItemBase>
    );
    expect(screen.getByText("Profile")).toBeTruthy();
  });

  it("renders with badge as string", () => {
    render(
      <NavItemBase type="link" href="/home" badge="5">
        Home
      </NavItemBase>
    );
    expect(screen.getByTestId("nav-badge")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders external link with icon", () => {
    render(
      <NavItemBase type="link" href="https://external.com">
        External
      </NavItemBase>
    );
    expect(screen.getByTestId("share-icon")).toBeTruthy();
  });

  it("renders collapsed mode without label", () => {
    render(
      <NavItemBase type="link" href="/home" icon={MockIcon} isCollapsed={true}>
        Home
      </NavItemBase>
    );
    // In collapsed mode, label is not shown
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.getByTestId("nav-icon")).toBeTruthy();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <NavItemBase type="link" href="/home" onClick={onClick}>
        Home
      </NavItemBase>
    );
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavList", () => {
  const basicItems = [
    { label: "Dashboard", href: "/dashboard", icon: MockIcon },
    { label: "Settings", href: "/settings", icon: MockIcon },
  ];

  it("renders all items", () => {
    render(<NavList items={basicItems} />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("renders a divider item", () => {
    const itemsWithDivider = [
      { label: "Dashboard", href: "/dashboard", icon: MockIcon },
      { divider: true },
      { label: "Settings", href: "/settings", icon: MockIcon },
    ];
    const { container } = render(<NavList items={itemsWithDivider as any} />);
    const hr = container.querySelector("hr");
    expect(hr).toBeTruthy();
  });

  it("renders collapsible items with children", () => {
    const collapsibleItems = [
      {
        label: "Admin",
        href: "/admin",
        icon: MockIcon,
        items: [
          { label: "Users", href: "/admin/users" },
          { label: "Roles", href: "/admin/roles" },
        ],
      },
    ];
    render(<NavList items={collapsibleItems as any} activeUrl="/admin/users" />);
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByText("Users")).toBeTruthy();
  });

  it("sets current item based on activeUrl", () => {
    render(<NavList items={basicItems} activeUrl="/dashboard" />);
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("renders in collapsed mode", () => {
    render(<NavList items={basicItems} isCollapsed={true} />);
    // In collapsed mode labels are hidden, but items still render
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(2);
  });

  it("calls item onClick when clicked", () => {
    const onClick = vi.fn();
    const itemsWithClick = [{ label: "Logout", href: "/logout", icon: MockIcon, onClick }];
    render(<NavList items={itemsWithClick as any} />);
    fireEvent.click(screen.getByRole("link", { name: /Logout/i }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe("NavItemButton", () => {
  it("renders with label and icon", () => {
    render(<NavItemButton label="Settings" icon={MockIcon} />);
    expect(screen.getByTestId("nav-icon")).toBeTruthy();
    expect(screen.getByLabelText("Settings")).toBeTruthy();
  });

  it("renders with md size by default", () => {
    render(<NavItemButton label="Home" icon={MockIcon} />);
    const link = screen.getByLabelText("Home");
    expect(link).toBeTruthy();
  });

  it("renders with lg size", () => {
    render(<NavItemButton label="Home" icon={MockIcon} size="lg" />);
    expect(screen.getByLabelText("Home")).toBeTruthy();
  });

  it("renders href as link", () => {
    render(<NavItemButton label="Home" icon={MockIcon} href="/home" />);
    const link = screen.getByLabelText("Home");
    expect(link.getAttribute("href")).toBe("/home");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<NavItemButton label="Home" icon={MockIcon} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("Home"));
    expect(onClick).toHaveBeenCalled();
  });

  it("renders with current style when current=true", () => {
    const { container } = render(<NavItemButton label="Home" icon={MockIcon} current={true} />);
    expect(container.querySelector("a")).toBeTruthy();
  });
});

describe("FeaturedCards", () => {
  it("FeaturedCardProgressBar renders with progress bar", () => {
    render(
      <FeaturedCardProgressBar
        title="Profile Completion"
        description="Complete your profile"
        confirmLabel="Complete"
        progress={60}
        onDismiss={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText("Profile Completion")).toBeTruthy();
    expect(screen.getByText("Complete your profile")).toBeTruthy();
    expect(screen.getByTestId("progress-bar")).toBeTruthy();
    expect(screen.getByText("Complete")).toBeTruthy();
  });

  it("FeaturedCardProgressBar calls onDismiss when Dismiss clicked", () => {
    const onDismiss = vi.fn();
    render(
      <FeaturedCardProgressBar
        title="Test"
        description="Desc"
        confirmLabel="Go"
        progress={50}
        onDismiss={onDismiss}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("Dismiss"));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("FeaturedCardProgressBar calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(
      <FeaturedCardProgressBar
        title="Test"
        description="Desc"
        confirmLabel="Confirm"
        progress={50}
        onDismiss={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("FeaturedCardProgressBar calls onDismiss when close button clicked", () => {
    const onDismiss = vi.fn();
    render(
      <FeaturedCardProgressBar
        title="Test"
        description="Desc"
        confirmLabel="Go"
        progress={50}
        onDismiss={onDismiss}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("close-button"));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("FeaturedCardProgressCircle renders with progress circle", () => {
    render(
      <FeaturedCardProgressCircle
        title="Score"
        description="Your score"
        confirmLabel="View"
        progress={75}
        onDismiss={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText("Score")).toBeTruthy();
    expect(screen.getByTestId("progress-circle")).toBeTruthy();
  });
});

describe("MobileNavigationHeader", () => {
  it("renders the menu button", () => {
    render(
      <MobileNavigationHeader>
        <div>Nav content</div>
      </MobileNavigationHeader>
    );
    expect(screen.getByTestId("menu-icon")).toBeTruthy();
    expect(screen.getByTestId("logo")).toBeTruthy();
  });

  it("renders children in the modal", () => {
    render(
      <MobileNavigationHeader>
        <div data-testid="nav-content">Nav Items</div>
      </MobileNavigationHeader>
    );
    expect(screen.getByTestId("nav-content")).toBeTruthy();
  });
});
