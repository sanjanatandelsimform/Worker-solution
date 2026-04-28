/**
 * Simple page render tests: TermsPage, PrivacyPage, AboutUs, SuccessPage, ErrorMessage
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";

// ── Mocks ──
vi.mock("@/assets/finch-checkmark.svg", () => ({ default: "checkmark.svg" }));
vi.mock("@/assets/logo.svg", () => ({ default: "logo.svg" }));
vi.mock("@/assets/aboutus-hero.svg", () => ({ default: "hero.svg" }));

import TermsPage from "@/pages/termsPolicy/TermsPage";
import PrivacyPage from "@/pages/termsPolicy/PrivacyPage";
import AboutUs from "@/pages/aboutUs/AboutUs";
import ErrorMessage from "@/components/common/ErrorMessage";
import { SuccessPage } from "@/pages/successPage/SuccessPage";

const minimalStore = configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authInitAttempted: true,
      tokens: { accessToken: "", refreshToken: "" },
    },
  },
});

function wrapRouter(ui: React.ReactNode, state?: object) {
  return (
    <Provider store={minimalStore}>
      <MemoryRouter initialEntries={[{ pathname: "/success", state }]}>{ui}</MemoryRouter>
    </Provider>
  );
}

// ── TermsPage ───────────────────────────────────────────────────────────
describe("TermsPage", () => {
  it("renders heading", () => {
    render(wrapRouter(<TermsPage />));
    expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
  });

  it("renders BeneStats branding", () => {
    render(wrapRouter(<TermsPage />));
    expect(screen.getByText("BeneStats")).toBeInTheDocument();
  });
});

// ── PrivacyPage ─────────────────────────────────────────────────────────
describe("PrivacyPage", () => {
  it("renders heading", () => {
    render(wrapRouter(<PrivacyPage />));
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders BeneStats branding", () => {
    render(wrapRouter(<PrivacyPage />));
    expect(screen.getByText("BeneStats")).toBeInTheDocument();
  });
});

// ── AboutUs ─────────────────────────────────────────────────────────────
describe("AboutUs", () => {
  it("renders without crashing", () => {
    const { container } = render(<AboutUs />);
    expect(container).toBeInTheDocument();
  });

  it("renders Introducing BeneStats heading", () => {
    render(<AboutUs />);
    expect(screen.getByText("Introducing BeneStats")).toBeInTheDocument();
  });
});

// ── ErrorMessage ────────────────────────────────────────────────────────
describe("ErrorMessage", () => {
  it("renders error message text", () => {
    render(<ErrorMessage errorMessage="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders with custom errorType", () => {
    render(<ErrorMessage errorMessage="Warning" errorType="warning" />);
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("renders with custom AlertIcon", () => {
    const Icon = ({ className }: { className?: string }) => (
      <span data-testid="alert-icon" className={className}>
        !
      </span>
    );
    render(<ErrorMessage errorMessage="Error" alertIcon={Icon} />);
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("calls onClose after timeout", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<ErrorMessage errorMessage="Timed" onClose={onClose} />);
    vi.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does not auto-close when onClose is not provided", () => {
    vi.useFakeTimers();
    render(<ErrorMessage errorMessage="No close" />);
    vi.advanceTimersByTime(10000);
    // No error thrown
    vi.useRealTimers();
  });

  it("clicking close button calls onClose", () => {
    const onClose = vi.fn();
    render(<ErrorMessage errorMessage="Closable" onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});

// ── SuccessPage ─────────────────────────────────────────────────────────
describe("SuccessPage", () => {
  it("renders with default props (no location state)", () => {
    render(wrapRouter(<SuccessPage />));
    // No button shown when no state.buttonText
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders with custom title from props", () => {
    render(wrapRouter(<SuccessPage title="Email Verified!" />));
    expect(screen.getByText("Email Verified!")).toBeInTheDocument();
  });

  it("renders with location state values", () => {
    render(
      wrapRouter(<SuccessPage />, {
        title: "Account Created",
        subtitle: "Welcome aboard",
        buttonText: "Go to Dashboard",
        buttonPath: "/dashboard",
      })
    );
    expect(screen.getByText("Account Created")).toBeInTheDocument();
    expect(screen.getByText("Welcome aboard")).toBeInTheDocument();
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
  });

  it("renders with shouldClearUser=true without crashing", () => {
    render(wrapRouter(<SuccessPage />, { shouldClearUser: true, buttonText: "OK" }));
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("clicking button navigates", () => {
    render(wrapRouter(<SuccessPage />, { buttonText: "Continue", buttonPath: "/" }));
    fireEvent.click(screen.getByText("Continue"));
    // No crash — navigates internally
  });
});
