import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import ErrorMessage from "../../../src/components/common/ErrorMessage";
import { LoadingSpinner } from "../../../src/components/common/LoadingSpinner";
import { GoogleSSOButton } from "../../../src/components/auth/GoogleSSOButton";
import { AvatarAddButton } from "../../../src/components/base/avatar/base-components/avatar-add-button";

// Mock @untitledui/icons
vi.mock("@untitledui/icons", () => ({
  X: ({ className }: any) => <span className={className} data-testid="x-icon" />,
  Plus: ({ className }: any) => <span className={className} data-testid="plus-icon" />,
}));

// Mock Button
vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick, iconLeading, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {iconLeading}
      {children}
    </button>
  ),
}));

// Mock react-loader-spinner
vi.mock("react-loader-spinner", () => ({
  Oval: ({ ariaLabel, height, width }: any) => (
    <div data-testid="loading-spinner" aria-label={ariaLabel} data-height={height} data-width={width} />
  ),
}));

// Mock SocialButton
vi.mock("@/components/base/buttons/social-button", () => ({
  SocialButton: ({ children, onClick, social, ...props }: any) => (
    <button onClick={onClick} data-social={social} {...props}>
      {children}
    </button>
  ),
}));

// Mock useGoogleSSO
const mockInitiateGoogleSignIn = vi.fn();
vi.mock("@/hooks/useGoogleSSO", () => ({
  useGoogleSSO: () => ({ initiateGoogleSignIn: mockInitiateGoogleSignIn }),
}));
vi.mock("../../hooks/useGoogleSSO", () => ({
  useGoogleSSO: () => ({ initiateGoogleSignIn: mockInitiateGoogleSignIn }),
}));

// Mock Tooltip
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, "aria-label": ariaLabel, onClick, ...props }: any) => (
    <button aria-label={ariaLabel} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("ErrorMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders error message text", () => {
    render(<ErrorMessage errorMessage="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("renders with custom error type class", () => {
    const { container } = render(
      <ErrorMessage errorType="warning" errorMessage="Warning!" />
    );
    expect(container.querySelector(".warning")).toBeTruthy();
  });

  it("renders alert icon when provided", () => {
    const AlertIcon = () => <span data-testid="alert-icon" />;
    render(<ErrorMessage alertIcon={AlertIcon} errorMessage="Error" />);
    expect(screen.getByTestId("alert-icon")).toBeTruthy();
  });

  it("renders close button", () => {
    render(<ErrorMessage errorMessage="Error" onClose={vi.fn()} />);
    expect(screen.getByTestId("x-icon")).toBeTruthy();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<ErrorMessage errorMessage="Error" onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it("auto-closes after 5000ms when onClose is provided", async () => {
    const onClose = vi.fn();
    render(<ErrorMessage errorMessage="Auto-close error" onClose={onClose} />);
    
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not auto-close when onClose is not provided", async () => {
    const { container } = render(<ErrorMessage errorMessage="No auto-close" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Nothing should crash
    expect(container).toBeTruthy();
  });

  it("renders with custom classess prop", () => {
    const { container } = render(
      <ErrorMessage errorMessage="Error" classess="my-custom-class" />
    );
    expect(container.querySelector(".my-custom-class")).toBeTruthy();
  });

  it("renders with custom textColor", () => {
    const { container } = render(
      <ErrorMessage errorMessage="Error" textColor="text-red-500" />
    );
    expect(container.querySelector(".text-red-500")).toBeTruthy();
  });
});

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute("aria-label")).toBe("loading");
    expect(spinner.getAttribute("data-height")).toBe("48");
    expect(spinner.getAttribute("data-width")).toBe("48");
  });

  it("renders with custom height and width", () => {
    render(<LoadingSpinner height={64} width={64} />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner.getAttribute("data-height")).toBe("64");
    expect(spinner.getAttribute("data-width")).toBe("64");
  });

  it("renders with custom ariaLabel", () => {
    render(<LoadingSpinner ariaLabel="loading data" />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner.getAttribute("aria-label")).toBe("loading data");
  });

  it("renders with custom bgClass", () => {
    const { container } = render(<LoadingSpinner bgClass="bg-white" />);
    expect(container.querySelector(".bg-white")).toBeTruthy();
  });
});

describe("GoogleSSOButton", () => {
  it("renders Google sign in button", () => {
    render(<GoogleSSOButton />);
    expect(screen.getByText("Sign in with Google")).toBeTruthy();
  });

  it("calls initiateGoogleSignIn when clicked", () => {
    render(<GoogleSSOButton />);
    fireEvent.click(screen.getByText("Sign in with Google"));
    expect(mockInitiateGoogleSignIn).toHaveBeenCalled();
  });

  it("renders with google social type", () => {
    render(<GoogleSSOButton />);
    const button = screen.getByText("Sign in with Google");
    expect(button.getAttribute("data-social")).toBe("google");
  });
});

describe("AvatarAddButton", () => {
  it("renders with xs size", () => {
    render(<AvatarAddButton size="xs" />);
    expect(screen.getByTestId("plus-icon")).toBeTruthy();
  });

  it("renders with sm size", () => {
    render(<AvatarAddButton size="sm" />);
    expect(screen.getByLabelText("Add user")).toBeTruthy();
  });

  it("renders with md size", () => {
    render(<AvatarAddButton size="md" />);
    expect(screen.getByLabelText("Add user")).toBeTruthy();
  });

  it("renders with custom title", () => {
    render(<AvatarAddButton size="sm" title="Add team member" />);
    expect(screen.getByLabelText("Add team member")).toBeTruthy();
  });

  it("renders plus icon inside the button", () => {
    render(<AvatarAddButton size="sm" />);
    expect(screen.getByTestId("plus-icon")).toBeTruthy();
  });
});
