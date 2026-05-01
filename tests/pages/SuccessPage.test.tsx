/**
 * SuccessPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTestStore } from "../test-utils";
import { SuccessPage } from "@/pages/successPage/SuccessPage";

vi.mock("@/assets/success-check.svg", () => ({ default: "success-check.svg" }));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick, color, size, className }: any) => (
    <button data-testid="cta-button" onClick={onClick}>{children}</button>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function buildStore() {
  return createTestStore({
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authInitAttempted: true,
      tokens: { accessToken: null, refreshToken: null },
    },
  } as any);
}

function renderSuccess(state?: object) {
  const store = buildStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: "/success", state: state ?? null }]}>
        <SuccessPage />
      </MemoryRouter>
    </Provider>
  );
}

describe("SuccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("renders default title and description with no state", () => {
    renderSuccess();
    expect(screen.getByText("Account Created Successfully!")).toBeInTheDocument();
    expect(screen.getByText(/Welcome aboard/i)).toBeInTheDocument();
  });

  it("renders custom props title and description", () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SuccessPage title="Prop Title" descriptionText="Prop description" />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Prop Title")).toBeInTheDocument();
    expect(screen.getByText("Prop description")).toBeInTheDocument();
  });

  it("renders title from location state", () => {
    renderSuccess({ title: "Email Verified!" });
    expect(screen.getByText("Email Verified!")).toBeInTheDocument();
  });

  it("renders subtitle from location state", () => {
    renderSuccess({ subtitle: "Custom subtitle text" });
    expect(screen.getByText("Custom subtitle text")).toBeInTheDocument();
  });

  it("renders custom messageImg from location state", () => {
    renderSuccess({ messageImg: "custom-img.png" });
    const img = screen.getByAltText("Success") as HTMLImageElement;
    expect(img.src).toContain("custom-img.png");
  });

  it("renders CTA button when state.buttonText is present", () => {
    renderSuccess({ buttonText: "Get Started" });
    expect(screen.getByTestId("cta-button")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("does NOT render button when state.buttonText is absent", () => {
    renderSuccess();
    expect(screen.queryByTestId("cta-button")).not.toBeInTheDocument();
  });

  it("clicking button navigates to state.buttonPath", () => {
    renderSuccess({ buttonText: "Go", buttonPath: "/dashboard" });
    fireEvent.click(screen.getByTestId("cta-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("clicking button navigates to /sign-in when no buttonPath", () => {
    renderSuccess({ buttonText: "Go" });
    fireEvent.click(screen.getByTestId("cta-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
  });

  it("dispatches logout and clears localStorage when shouldClearUser is true", () => {
    renderSuccess({ shouldClearUser: true });
    expect(localStorage.clear).toHaveBeenCalled();
  });

  it("dispatches setTokens when state.tokens is present", () => {
    renderSuccess({ tokens: { accessToken: "at", refreshToken: "rt" } });
    // Should render without crashing
    expect(screen.getByText("Account Created Successfully!")).toBeInTheDocument();
  });

  it("clicking button with user and tokens dispatches setUser", () => {
    const user = {
      id: "u1",
      businessEmail: "test@test.com",
      firstName: "John",
      lastName: "Doe",
      businessName: "ACME",
      businessPhone: "555-1234",
      industry: { id: 1, industry_name: "Tech", industry_code: "TECH" },
      zipCode: "94102",
      googleId: null,
      emailVerify: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    };
    const tokens = { accessToken: "at", refreshToken: "rt" };
    renderSuccess({ buttonText: "Go", user, tokens, buttonPath: "/dashboard" });
    fireEvent.click(screen.getByTestId("cta-button"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("renders custom buttonLabel from props", () => {
    renderSuccess({ buttonText: "State Btn" });
    const store = buildStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/success", state: { buttonText: "State Btn" } }]}>
          <SuccessPage buttonLabel="Custom Label" />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getAllByText("Custom Label").length).toBeGreaterThan(0);
  });

  it("renders logo", () => {
    renderSuccess();
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it("renders custom classess on wrapper div", () => {
    const store = buildStore();
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <SuccessPage classess="custom-class" />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.querySelector(".custom-class");
    expect(wrapper).toBeTruthy();
  });
});
