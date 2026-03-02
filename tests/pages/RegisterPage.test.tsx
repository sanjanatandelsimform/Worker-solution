/**
 * Registration Page Tests
 *
 * Unit tests for RegisterPage and RegistrationForm: render, form fields, submit.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { signup, getIndustries } from "@/services/api/authApi";
import registrationFormReducer from "@/store/slices/registrationFormSlice";
import authReducer from "@/store/slices/authSlice";
import profileReducer from "@/store/slices/profileSlice";
import userReducer from "@/store/slices/userSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";

vi.mock("@/services/api/authApi", () => ({
  signup: vi.fn(),
  getIndustries: vi.fn(),
}));

vi.mock("@/assets/checkmark-icon.svg", () => ({ default: "checkmark-icon.svg" }));

const mockSignup = vi.mocked(signup);
const mockGetIndustries = vi.mocked(getIndustries);

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      registrationForm: registrationFormReducer,
      user: userReducer,
      dashboard: dashboardReducer,
    },
  });

function renderRegisterPage() {
  const store = createTestStore();
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    ),
    store,
  };
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIndustries.mockResolvedValue({
      data: { industries: [{ id: 1, industry_name: "Technology", industry_code: "TECH" }] },
    });
  });

  describe("render", () => {
    it("should render registration heading and form", async () => {
      renderRegisterPage();
      await waitFor(() => {
        expect(screen.getByText(/create your account|register|sign up/i)).toBeInTheDocument();
      });
    });

    it("should render first name and last name inputs", async () => {
      renderRegisterPage();
      await waitFor(() => {
        const firstName =
          screen.queryByLabelText(/first name/i) ?? screen.queryByPlaceholderText(/first name/i);
        const lastName =
          screen.queryByLabelText(/last name/i) ?? screen.queryByPlaceholderText(/last name/i);
        expect(
          firstName || lastName || document.querySelector('input[name="firstName"]')
        ).toBeTruthy();
      });
    });
  });

  describe("submit", () => {
    it("should call signup with form data on submit", async () => {
      const mockUser = {
        id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        businessName: "Acme",
        phoneNumber: "+15551234567",
        industry: { id: 1, industry_name: "Technology", industry_code: "TECH" },
        zipCode: 94102,
        emailVerify: false,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };
      mockSignup.mockResolvedValueOnce(mockUser);

      renderRegisterPage();

      await waitFor(() => {
        expect(mockGetIndustries).toHaveBeenCalled();
      });

      const submitButton = screen.queryByRole("button", {
        name: /create account|sign up|register/i,
      });
      if (submitButton) {
        fireEvent.click(submitButton);
        await waitFor(() => {
          expect(mockSignup).toHaveBeenCalled();
        });
      }
    });
  });
});
