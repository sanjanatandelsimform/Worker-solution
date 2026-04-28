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

vi.mock("@/components/common/ErrorMessage", () => ({
  default: () => null,
  ErrorMessage: () => null,
}));

const authUser = {
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
};

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
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        authInitAttempted: true,
        tokens: { accessToken: "at", refreshToken: "rt" },
      },
    },
  });

const wrap = (ui: React.ReactNode) => (
  <Provider store={createStore()}>
    <MemoryRouter>{ui}</MemoryRouter>
  </Provider>
);

// ── ChangePasswordModal ──
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";

describe("ChangePasswordModal", () => {
  it("renders when open", () => {
    render(wrap(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />));
    expect(screen.getByText("Change Your Password")).toBeInTheDocument();
  });

  it("renders password fields", () => {
    render(wrap(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />));
    expect(screen.getByText("Current Password")).toBeInTheDocument();
    expect(screen.getByText("New Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
  });

  it("renders Update button", () => {
    render(wrap(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />));
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(wrap(<ChangePasswordModal isOpen={false} onClose={vi.fn()} />));
    expect(screen.queryByText("Change Your Password")).toBeNull();
  });
});

// ── UpdateYourEmailModal ──
import { UpdateYourEmailModal } from "@/components/modals/UpdateYourEmailModal";

describe("UpdateYourEmailModal", () => {
  it("renders when open", () => {
    render(wrap(<UpdateYourEmailModal isOpen={true} onClose={vi.fn()} getResponse={vi.fn()} />));
    expect(screen.getByText("Update Your Email")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(wrap(<UpdateYourEmailModal isOpen={true} onClose={vi.fn()} getResponse={vi.fn()} />));
    expect(screen.getByText(/First Name/)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(wrap(<UpdateYourEmailModal isOpen={false} onClose={vi.fn()} getResponse={vi.fn()} />));
    expect(screen.queryByText("Update Your Email")).toBeNull();
  });
});

// ── UpdateYourInformationModal ──
import { UpdateYourInformationModal } from "@/components/modals/UpdateYourInformationModal";

describe("UpdateYourInformationModal", () => {
  it("renders when open", () => {
    render(
      wrap(<UpdateYourInformationModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    );
    expect(screen.getByText("Update Your Information")).toBeInTheDocument();
  });

  it("renders name fields", () => {
    render(
      wrap(<UpdateYourInformationModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    );
    expect(screen.getByText(/First Name/)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      wrap(<UpdateYourInformationModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    );
    expect(screen.getByText("Update Information")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      wrap(<UpdateYourInformationModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
    );
    expect(screen.queryByText("Update Your Information")).toBeNull();
  });
});
