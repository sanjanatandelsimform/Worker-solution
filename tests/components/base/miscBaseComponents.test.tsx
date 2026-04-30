import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import React from "react";

// Test InlineProgressBar
import InlineProgressBar from "../../../src/components/base/progress-indicators/InlineProgressBar";

// Test payment icons
import { VisaIcon } from "../../../src/components/foundations/payment-icons/index";
import AmexIcon from "../../../src/components/foundations/payment-icons/amex-icon";
import ApplePayIcon from "../../../src/components/foundations/payment-icons/apple-pay-icon";
import DiscoverIcon from "../../../src/components/foundations/payment-icons/discover-icon";
import MastercardIcon from "../../../src/components/foundations/payment-icons/mastercard-icon";
import PayPalIcon from "../../../src/components/foundations/payment-icons/paypal-icon";
import StripeIcon from "../../../src/components/foundations/payment-icons/stripe-icon";
import UnionPayIcon from "../../../src/components/foundations/payment-icons/union-pay-icon";

// Test logos
import { UntitledLogo } from "../../../src/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "../../../src/components/foundations/logo/untitledui-logo-minimal";

// Test dot icon
import { Dot } from "../../../src/components/foundations/dot-icon";

// Test AvatarLabelGroup
import { AvatarLabelGroup } from "../../../src/components/base/avatar/avatar-label-group";
import { AvatarCompanyIcon } from "../../../src/components/base/avatar/base-components/avatar-company-icon";

// Test badge-styles (imported to force coverage)
import { filledColors } from "../../../src/components/base/badges/badge-styles";

// Test use-resize-observer
import { useResizeObserver } from "../../../src/hooks/use-resize-observer";

// Mock react-aria-components
vi.mock("react-aria-components", () => ({
  Button: ({ children, onClick, "aria-label": ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

// Mock Tooltip
vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, "aria-label": ariaLabel, ...props }: any) => (
    <button aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

// Mock @untitledui/icons
vi.mock("@untitledui/icons", () => ({
  Plus: ({ className }: any) => <span className={className} data-testid="plus-icon" />,
}));

// Mock Avatar component (used by AvatarLabelGroup)
vi.mock("@/components/base/avatar/avatar", () => ({
  Avatar: ({ size, src, initials }: any) => (
    <div data-testid="avatar" data-size={size}>
      {initials || (src ? <img src={src} alt="avatar" /> : null)}
    </div>
  ),
}));

describe("InlineProgressBar", () => {
  it("renders with percentage >= 10 shows inside fill", () => {
    const { container } = render(<InlineProgressBar percentage={50} />);
    expect(screen.getByText("50%")).toBeTruthy();
    const fill = container.querySelector(".transition-all");
    expect(fill?.getAttribute("style")).toContain("50%");
  });

  it("renders with percentage < 10 shows outside fill", () => {
    render(<InlineProgressBar percentage={5} />);
    expect(screen.getByText("5%")).toBeTruthy();
  });

  it("renders with 0% percentage", () => {
    render(<InlineProgressBar percentage={0} />);
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("renders with 100% percentage", () => {
    render(<InlineProgressBar percentage={100} />);
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("renders with custom color", () => {
    const { container } = render(<InlineProgressBar percentage={60} color="bg-blue-500" />);
    const fill = container.querySelector(".bg-blue-500");
    expect(fill).toBeTruthy();
  });

  it("renders with custom className", () => {
    const { container } = render(<InlineProgressBar percentage={50} className="h-12" />);
    const wrapper = container.querySelector(".h-12");
    expect(wrapper).toBeTruthy();
  });
});

describe("Payment Icons", () => {
  it("renders VisaIcon", () => {
    const { container } = render(<VisaIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders AmexIcon", () => {
    const { container } = render(<AmexIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders ApplePayIcon", () => {
    const { container } = render(<ApplePayIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders DiscoverIcon", () => {
    const { container } = render(<DiscoverIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders MastercardIcon", () => {
    const { container } = render(<MastercardIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders PayPalIcon", () => {
    const { container } = render(<PayPalIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders StripeIcon", () => {
    const { container } = render(<StripeIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders UnionPayIcon", () => {
    const { container } = render(<UnionPayIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("Foundation logos", () => {
  it("renders UntitledLogo", () => {
    const { container } = render(<UntitledLogo />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders UntitledLogoMinimal", () => {
    const { container } = render(<UntitledLogoMinimal />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("Dot icon", () => {
  it("renders Dot with default md size", () => {
    const { container } = render(<Dot />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("width")).toBe("10");
  });

  it("renders Dot with sm size", () => {
    const { container } = render(<Dot size="sm" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("8");
  });
});

describe("AvatarLabelGroup", () => {
  it("renders with title, subtitle, and avatar", () => {
    render(
      <AvatarLabelGroup size="md" title="John Doe" subtitle="Software Engineer" />
    );
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Software Engineer")).toBeTruthy();
  });

  it("renders with sm size", () => {
    render(<AvatarLabelGroup size="sm" title="Alice" subtitle="Developer" />);
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("renders with lg size", () => {
    render(<AvatarLabelGroup size="lg" title="Bob" subtitle="Manager" />);
    expect(screen.getByText("Bob")).toBeTruthy();
  });

  it("renders with xl size", () => {
    render(<AvatarLabelGroup size="xl" title="Carol" subtitle="CEO" />);
    expect(screen.getByText("Carol")).toBeTruthy();
  });
});

describe("AvatarCompanyIcon", () => {
  it("renders with src and alt", () => {
    render(<AvatarCompanyIcon size="md" src="logo.png" alt="Company Logo" />);
    const img = screen.getByAltText("Company Logo");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("logo.png");
  });

  it("renders with different sizes", () => {
    const sizes: Array<"xs" | "sm" | "md" | "lg" | "xl" | "2xl"> = ["xs", "sm", "md", "lg", "xl", "2xl"];
    sizes.forEach(size => {
      const { container } = render(<AvatarCompanyIcon size={size} src="icon.png" />);
      const img = container.querySelector("img");
      expect(img).toBeTruthy();
    });
  });
});

describe("badge-styles module", () => {
  it("exports filledColors with all color variants", () => {
    expect(filledColors.gray).toBeTruthy();
    expect(filledColors.brand).toBeTruthy();
    expect(filledColors.error).toBeTruthy();
    expect(filledColors.warning).toBeTruthy();
    expect(filledColors.success).toBeTruthy();
  });
});

describe("useResizeObserver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("observes element when ref is provided", () => {
    const onResize = vi.fn();
    const mockElement = document.createElement("div");
    const ref = { current: mockElement };
    
    const mockObserve = vi.fn();
    let capturedCallback: ((entries: any[]) => void) | null = null;
    
    const MockResizeObserver = function(callback: (entries: any[]) => void) {
      capturedCallback = callback;
      return {
        observe: mockObserve,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    };
    
    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = MockResizeObserver as any;
    
    const { unmount } = renderHook(() => useResizeObserver({ ref, onResize }));
    
    expect(mockObserve).toHaveBeenCalledWith(mockElement, { box: undefined });
    
    // Trigger the resize observer
    if (capturedCallback) {
      capturedCallback([{ target: mockElement }]);
    }
    expect(onResize).toHaveBeenCalled();
    
    unmount();
    
    window.ResizeObserver = originalResizeObserver;
  });

  it("does nothing when ref.current is null", () => {
    const onResize = vi.fn();
    const ref = { current: null };
    
    renderHook(() => useResizeObserver({ ref, onResize }));
    // No observer should be set up since ref.current is null
    expect(onResize).not.toHaveBeenCalled();
  });

  it("does nothing when ref is undefined", () => {
    const onResize = vi.fn();
    
    renderHook(() => useResizeObserver({ ref: undefined, onResize }));
    expect(onResize).not.toHaveBeenCalled();
  });

  it("uses window resize event when ResizeObserver not available", () => {
    const onResize = vi.fn();
    const mockElement = document.createElement("div");
    const ref = { current: mockElement };
    
    const originalResizeObserver = window.ResizeObserver;
    // @ts-expect-error test intentionally provides invalid prop shape
    delete window.ResizeObserver;
    
    const addEventSpy = vi.spyOn(window, "addEventListener");
    const removeEventSpy = vi.spyOn(window, "removeEventListener");
    
    const { unmount } = renderHook(() => useResizeObserver({ ref, onResize }));
    
    expect(addEventSpy).toHaveBeenCalledWith("resize", onResize, false);
    
    unmount();
    
    expect(removeEventSpy).toHaveBeenCalledWith("resize", onResize, false);
    
    window.ResizeObserver = originalResizeObserver;
    addEventSpy.mockRestore();
    removeEventSpy.mockRestore();
  });

  it("handles empty entries in ResizeObserver callback", () => {
    const onResize = vi.fn();
    const mockElement = document.createElement("div");
    const ref = { current: mockElement };
    
    let capturedCallback: ((entries: any[]) => void) | null = null;

    const MockResizeObserver = function(callback: (entries: any[]) => void) {
      capturedCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    };

    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = MockResizeObserver as any;

    renderHook(() => useResizeObserver({ ref, onResize }));

    // Trigger with empty entries
    if (capturedCallback) {
      capturedCallback([]);
    }
    expect(onResize).not.toHaveBeenCalled();

    window.ResizeObserver = originalResizeObserver;
  });
});
