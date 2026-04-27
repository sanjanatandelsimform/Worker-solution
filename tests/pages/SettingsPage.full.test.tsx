/**
 * SettingsPage — render + basic interaction tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
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

// Mock hooks
vi.mock("@/hooks/useModalConfig", () => ({
  useModalConfig: () => ({
    retakeAssessmentModal: { title: "Retake", description: "", icon: "", primaryLabel: "Confirm", secondaryLabel: "Cancel" },
    deleteAccountModal: { title: "Delete", description: "", icon: "", primaryLabel: "Delete", secondaryLabel: "Cancel" },
    updateCompletedModal: { title: "Updated", description: "", icon: "" },
    updateInfoSuccessModal: { title: "Info Updated", description: "", icon: "" },
  }),
}));

vi.mock("@/hooks/useAssessmentStatus", () => ({
  useAssessmentStatus: vi.fn(() => ({
    completionCount: 4,
    isLoading: false,
    assessmentData: null,
  })),
}));

vi.mock("@/hooks/use-breakpoint", () => ({
  useBreakpoint: () => true,
}));

// Mock heavy sub-components
vi.mock("@/components/modals/ChangePasswordModal", () => ({
  ChangePasswordModal: () => null,
}));
vi.mock("@/components/modals/UpdateYourEmailModal", () => ({
  UpdateYourEmailModal: () => null,
}));
vi.mock("@/components/modals/UpdateYourInformationModal", () => ({
  UpdateYourInformationModal: () => null,
}));
vi.mock("@/components/modals/SessionExpiredModal", () => ({
  default: () => null,
}));
vi.mock("@/components/dashboard/DashboardSidebar", () => ({
  DashboardSidebar: () => <div data-testid="sidebar" />,
  default: () => <div data-testid="sidebar" />,
}));
vi.mock("@/components/common/ErrorMessage", () => ({
  default: () => null,
}));
vi.mock("@/components/modals/BaseModalWithIcon", () => ({
  BaseModalWithIcon: () => null,
}));

import SettingsPage from "@/pages/settings/SettingsPage";

const mockUser = {
  id: "u1",
  firstName: "Jane",
  lastName: "Doe",
  businessName: "Acme",
  phoneNumber: "+15551234567",
  industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
  zipCode: 94102,
  emailVerify: true,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  businessEmail: "jane@acme.com",
};

const createStore = (userOverride?: object) =>
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
        user: { ...mockUser, ...userOverride } as any,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt" },
      },
      profile: {
        loading: false,
        error: null,
        passwordAttempts: 0,
        isAccountLocked: false,
        lockoutExpiry: null,
      },
    },
  });

function renderSettings(store = createStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders without crashing", () => {
    const { container } = renderSettings();
    expect(container).toBeInTheDocument();
  });

  it("shows user first and last name", () => {
    renderSettings();
    expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
  });

  it("shows user email", () => {
    renderSettings();
    expect(screen.getByDisplayValue("jane@acme.com")).toBeInTheDocument();
  });

  it("renders sidebar", () => {
    renderSettings();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders with null user without crashing", () => {
    const store = configureStore({
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
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authInitAttempted: true,
          tokens: { accessToken: "", refreshToken: "" },
        },
        profile: {
          loading: false,
          error: null,
          passwordAttempts: 0,
          isAccountLocked: false,
          lockoutExpiry: null,
        },
      },
    });
    const { container } = renderSettings(store);
    expect(container).toBeInTheDocument();
  });
});
