/**
 * PrivacyPage and TermsPage Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivacyPage from "@/pages/termsPolicy/PrivacyPage";
import TermsPage from "@/pages/termsPolicy/TermsPage";

vi.mock("@/components/base/buttons/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="back-button" onClick={onClick}>{children}</button>
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

describe("PrivacyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Privacy Policy heading", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders A2B logo/title", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );
    expect(screen.getByText("A2B")).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });

  it("renders content paragraphs", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );
    const paragraphs = screen.getAllByText(/Acceptance of Terms/i);
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it("renders Back button", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("clicking Back navigates to previous page", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("back-button"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe("TermsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Terms and Conditions heading", () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Terms and Conditions")).toBeInTheDocument();
  });

  it("renders A2B logo/title", () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );
    expect(screen.getByText("A2B")).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });

  it("renders Back button", () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("back-button")).toBeInTheDocument();
  });

  it("clicking Back navigates to previous page", () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("back-button"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("renders content sections", () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );
    const sections = screen.getAllByText(/Acceptance of Terms/i);
    expect(sections.length).toBeGreaterThan(0);
  });
});
