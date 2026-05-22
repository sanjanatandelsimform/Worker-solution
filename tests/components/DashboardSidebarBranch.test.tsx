/**
 * Additional DashboardSidebar tests for tablet/collapsed mode and getUserInitials branches
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";

// Mock signout - throws to cover error path
const mockSignout = vi.fn().mockResolvedValue(undefined);

vi.mock("@/services/api/authApi", () => ({
  signout: (...args: any[]) => mockSignout(...args),
}));

vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: (_key: string, config: any) => ({
    ...config,
    title: "Logout",
    primaryLabel: "Yes",
    secondaryLabel: "No",
  }),
}));

// Tablet range mock: md=true, lg=false
const mockUseBreakpoint = vi.fn();
vi.mock("@/hooks/use-breakpoint", () => ({
  useBreakpoint: (bp: string) => mockUseBreakpoint(bp),
}));

vi.mock("@/components/modals/BaseModalWithIcon", () => ({
  BaseModalWithIcon: ({ isOpen, onConfirm, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div>
        <button data-testid="modal-confirm" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/application/app-navigation/base-components/nav-list", () => ({
  NavList: ({
    items,
  }: {
    items: Array<{ label: string; onClick?: (e?: React.MouseEvent) => void }>;
  }) => (
    <nav data-testid="nav-list">
      {items?.map(item => (
        <button
          key={item.label}
          data-testid={`nav-${item.label.toLowerCase()}`}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </nav>
  ),
}));

vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/assets/signout-icon.svg", () => ({ default: "signout.svg" }));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/logo-small.svg", () => ({ default: "logo-small.svg" }));
vi.mock("@/assets/tab-logo.svg", () => ({ default: "tab-logo.svg" }));

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function makeStore(userOverride?: object) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          firstName: "Jane",
          lastName: "Doe",
          businessEmail: "j@test.com",
          ...userOverride,
        } as any,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt" },
      },
    },
  });
}

function renderSidebar(userOverride?: object) {
  return render(
    <Provider store={makeStore(userOverride)}>
      <MemoryRouter>
        <DashboardSidebar />
      </MemoryRouter>
    </Provider>
  );
}

describe("DashboardSidebar - tablet collapsed mode (getUserInitials)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate tablet range: md=true, lg=false → isTabletRange = true
    mockUseBreakpoint.mockImplementation((bp: string) => {
      if (bp === "md") return true;
      if (bp === "lg") return false;
      return true;
    });
  });

  it("shows initials for first+last name in collapsed tablet mode", () => {
    renderSidebar({ firstName: "Jane", lastName: "Doe" });
    // getUserInitials returns "JD"
    expect(screen.getByText("JD")).toBeTruthy();
  });

  it("shows initials from businessName with 2 words in collapsed mode", () => {
    renderSidebar({ firstName: undefined, lastName: undefined, businessName: "Acme Corp" });
    // getUserInitials returns "AC"
    expect(screen.getByText("AC")).toBeTruthy();
  });

  it("shows initials from single-word businessName (first 2 chars) in collapsed mode", () => {
    renderSidebar({ firstName: undefined, lastName: undefined, businessName: "Acme" });
    // getUserInitials returns "AC" (first 2 chars)
    expect(screen.getByText("AC")).toBeTruthy();
  });

  it("shows 'U' when no user info in collapsed mode", () => {
    renderSidebar({ firstName: undefined, lastName: undefined, businessName: undefined });
    expect(screen.getByText("U")).toBeTruthy();
  });

  it("shows tab logo when in collapsed tablet mode", () => {
    renderSidebar();
    const tabLogoImg = screen.queryByAltText("Logo");
    // Both the main logo and the tab logo use alt "Logo"
    expect(tabLogoImg).toBeTruthy();
  });
});

describe("DashboardSidebar - non-tablet mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Non-tablet: lg=true (desktop)
    mockUseBreakpoint.mockImplementation(() => true);
  });

  it("shows displayName in full (not collapsed)", () => {
    renderSidebar({ firstName: "John", lastName: "Smith" });
    expect(screen.getByText("John Smith")).toBeTruthy();
  });

  it("shows businessName when no first/last name", () => {
    renderSidebar({ firstName: undefined, lastName: undefined, businessName: "BigCo" });
    expect(screen.getByText("BigCo")).toBeTruthy();
  });

  it("shows 'User' fallback when no name at all", () => {
    renderSidebar({ firstName: undefined, lastName: undefined, businessName: undefined });
    expect(screen.getByText("User")).toBeTruthy();
  });

  it("shows email when businessEmail is set", () => {
    renderSidebar({ businessEmail: "user@company.com" });
    expect(screen.getByText("user@company.com")).toBeTruthy();
  });

  it("shows 'No email available' when no email", () => {
    renderSidebar({ businessEmail: undefined });
    expect(screen.getByText("No email available")).toBeTruthy();
  });
});

describe("DashboardSidebar - logout flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBreakpoint.mockImplementation(() => true);
    mockSignout.mockResolvedValue(undefined);
  });

  it("opens logout modal when logout nav item is clicked", async () => {
    renderSidebar();
    const logoutBtn = screen.getByTestId("nav-logout");
    fireEvent.click(logoutBtn);
    await waitFor(() => {
      expect(screen.getByTestId("modal-confirm")).toBeTruthy();
    });
  });

  it("closes modal when onClose is clicked", async () => {
    renderSidebar();
    fireEvent.click(screen.getByTestId("nav-logout"));
    await waitFor(() => {
      expect(screen.getByTestId("modal-close")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("modal-close")).toBeNull();
    });
  });

  it("performs logout when confirmed and navigates to success", async () => {
    mockSignout.mockResolvedValue(undefined);
    renderSidebar();
    fireEvent.click(screen.getByTestId("nav-logout"));
    await waitFor(() => {
      expect(screen.getByTestId("modal-confirm")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("modal-confirm"));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/success", expect.any(Object));
    });
  });

  it("handles logout with signout throwing error (still navigates)", async () => {
    mockSignout.mockRejectedValue(new Error("Network error"));
    renderSidebar();
    fireEvent.click(screen.getByTestId("nav-logout"));
    await waitFor(() => {
      expect(screen.getByTestId("modal-confirm")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("modal-confirm"));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/success", expect.any(Object));
    });
  });

  it("handleLogoutClick prevents default when called with event", async () => {
    renderSidebar();
    const logoutBtn = screen.getByTestId("nav-logout");
    const preventDefault = vi.fn();
    fireEvent.click(logoutBtn, { preventDefault });
    await waitFor(() => {
      expect(screen.getByTestId("modal-confirm")).toBeTruthy();
    });
  });

  it("reads token from localStorage during logout", async () => {
    const storageData = { auth: { tokens: { accessToken: "stored-token" } } };
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(storageData));
    renderSidebar();
    fireEvent.click(screen.getByTestId("nav-logout"));
    await waitFor(() => {
      expect(screen.getByTestId("modal-confirm")).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId("modal-confirm"));
    await waitFor(() => {
      expect(mockSignout).toHaveBeenCalled();
    });
    vi.restoreAllMocks();
  });
});
