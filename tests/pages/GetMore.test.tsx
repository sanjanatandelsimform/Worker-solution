/**
 * GetMore Page Tests
 *
 * Unit tests for GetMore page: Manual Entry navigates to /assessment.
 * Finch flow has been removed from this page (see specs/005-finch-integration).
 *
 * T022: Manual Entry plan → navigates to /assessment
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GetMore from "@/pages/getMore/GetMore";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Helper ─────────────────────────────────────────────────────────────────

function renderGetMore() {
  return render(
    <MemoryRouter>
      <GetMore />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("GetMore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T022 — Manual Entry plan selected → navigates to /assessment
  it("clicking 'Let's get started' with Manual Entry plan navigates to /assessment", async () => {
    renderGetMore();

    // The page renders with both plan options
    await waitFor(() => {
      expect(screen.getByText("Manual Entry")).toBeInTheDocument();
    });

    // Select the Manual Entry plan by clicking its radio button
    const radios = screen.getAllByRole("radio");
    // The second radio is the manual entry plan
    const manualRadio = radios[1];
    fireEvent.click(manualRadio);

    // Click the bottom bar button
    const startButton = screen.getByText(/let's get started/i);
    fireEvent.click(startButton);

    expect(mockNavigate).toHaveBeenCalledWith("/assessment");
  });
});
