import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

describe("AuthErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error", () => {
    render(
      <MemoryRouter>
        <AuthErrorBoundary>
          <div>Normal Content</div>
        </AuthErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText("Normal Content")).toBeInTheDocument();
  });

  it("renders error UI when child throws", () => {
    render(
      <MemoryRouter>
        <AuthErrorBoundary>
          <ThrowError error={new Error("Test auth error")} />
        </AuthErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We encountered an error/)).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go to Home")).toBeInTheDocument();
  });

  it("shows error details in dev mode", () => {
    render(
      <MemoryRouter>
        <AuthErrorBoundary>
          <ThrowError error={new Error("Detailed error msg")} />
        </AuthErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText("Error Details:")).toBeInTheDocument();
    expect(screen.getByText("Detailed error msg")).toBeInTheDocument();
  });

  it("Try Again button reloads the page", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <MemoryRouter>
        <AuthErrorBoundary>
          <ThrowError error={new Error("error")} />
        </AuthErrorBoundary>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Try Again"));
    expect(reloadMock).toHaveBeenCalled();
  });

  it("Go to Home link has correct href", () => {
    render(
      <MemoryRouter>
        <AuthErrorBoundary>
          <ThrowError error={new Error("error")} />
        </AuthErrorBoundary>
      </MemoryRouter>
    );
    const link = screen.getByText("Go to Home");
    expect(link).toHaveAttribute("href", "/");
  });
});
