import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PreparingDashboard from "../../src/pages/recommendations/PreparingDashboard";
import {
  PREPARING_MSG_AUTOMATED,
  PREPARING_MSG_NON_AUTOMATED,
} from "../../src/constants/preparingDashboardMessages";

vi.mock("@/assets/preparingData.svg", () => ({ default: "preparingData.svg" }));

// ─── T016: PreparingDashboard unit tests (User Story 3) ───────────────────

describe("PreparingDashboard", () => {
  it("always renders the heading 'Preparing your dashboard'", () => {
    render(<PreparingDashboard />);
    expect(screen.getByText("Preparing your dashboard")).toBeInTheDocument();
  });

  it("renders the non-automated default message when no description is provided", () => {
    render(<PreparingDashboard />);
    expect(screen.getByText(PREPARING_MSG_NON_AUTOMATED)).toBeInTheDocument();
    expect(screen.queryByText(PREPARING_MSG_AUTOMATED)).not.toBeInTheDocument();
  });

  it("renders the custom description when passed as a prop", () => {
    render(<PreparingDashboard description="Custom loading message" />);
    expect(screen.getByText("Custom loading message")).toBeInTheDocument();
  });

  it("renders the automated message when PREPARING_MSG_AUTOMATED is passed", () => {
    render(<PreparingDashboard description={PREPARING_MSG_AUTOMATED} />);
    expect(screen.getByText(/24-36 hours/i)).toBeInTheDocument();
    expect(screen.queryByText(/up to 2 weeks/i)).not.toBeInTheDocument();
  });

  it("renders the non-automated message when PREPARING_MSG_NON_AUTOMATED is passed", () => {
    render(<PreparingDashboard description={PREPARING_MSG_NON_AUTOMATED} />);
    expect(screen.getByText(/up to 2 weeks/i)).toBeInTheDocument();
    expect(screen.queryByText(/24-36 hours/i)).not.toBeInTheDocument();
  });

  it("renders the preparing data image", () => {
    render(<PreparingDashboard />);
    expect(screen.getByAltText("Preparing Dashboard")).toBeInTheDocument();
  });
});
