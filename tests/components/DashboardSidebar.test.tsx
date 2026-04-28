/**
 * DashboardSidebar render tests
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import finchStatusReducer from "@/store/slices/finchStatusSlice";
import workforceReducer from "@/store/slices/workforceSlice";
import industryReducer from "@/store/slices/industrySlice";
import recommendationsReducer from "@/store/slices/recommendationsSlice";

vi.mock("@/services/api/authApi", () => ({
  signout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: () => ({
    logoutModal: {
      title: "Logout",
      description: "Are you sure?",
      icon: "",
      primaryLabel: "Yes",
      secondaryLabel: "No",
    },
  }),
}));

vi.mock("@/hooks/use-breakpoint", () => ({
  useBreakpoint: vi.fn(() => true),
}));

vi.mock("@/components/modals/BaseModalWithIcon", () => ({
  BaseModalWithIcon: () => null,
}));

vi.mock("@/components/application/app-navigation/base-components/nav-list", () => ({
  NavList: () => <nav data-testid="nav-list" />,
}));

vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/assets/signout-icon.svg", () => ({ default: "signout.svg" }));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      registrationForm: registrationFormReducer,
      user: userReducer,
      dashboard: dashboardReducer,
      finchStatus: finchStatusReducer,
      workforce: workforceReducer,
      industry: industryReducer,
      recommendations: recommendationsReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: "u1",
          firstName: "Jane",
          lastName: "Doe",
          businessName: "Acme",
          phoneNumber: "+1",
          industry: { id: 1, industry_name: "Tech", industry_code: "T" },
          zipCode: 90210,
          emailVerify: true,
          createdAt: "",
          updatedAt: "",
        },
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt" },
      },
    },
  });

function renderSidebar(props = {}) {
  return render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <DashboardSidebar {...props} />
      </MemoryRouter>
    </Provider>
  );
}

describe("DashboardSidebar", () => {
  it("renders without crashing", () => {
    const { container } = renderSidebar();
    expect(container).toBeInTheDocument();
  });

  it("renders nav elements", () => {
    renderSidebar();
    expect(screen.getAllByTestId("nav-list").length).toBeGreaterThan(0);
  });

  it("renders with custom activeUrl", () => {
    const { container } = renderSidebar({ activeUrl: "/settings" });
    expect(container).toBeInTheDocument();
  });
});
