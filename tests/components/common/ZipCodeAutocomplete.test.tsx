/**
 * ZipCodeAutocomplete Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ZipCodeAutocomplete } from "@/components/common/ZipCodeAutocomplete";
import { lookupZipCodes } from "@/services/api/assessmentApi";

vi.mock("@/services/api/assessmentApi", () => ({
  lookupZipCodes: vi.fn(),
}));

const mockLookup = vi.mocked(lookupZipCodes);

describe("ZipCodeAutocomplete", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLookup.mockResolvedValue([]);
  });

  it("should render an input element", () => {
    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("should call onChange when typing digits", () => {
    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "941" } });
    expect(defaultProps.onChange).toHaveBeenCalledWith("941");
  });

  it("should reject non-numeric input", () => {
    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "abc" } });
    // onChange should not be called with non-numeric
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it("should render with custom placeholder", () => {
    render(<ZipCodeAutocomplete {...defaultProps} placeholder="Enter ZIP" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Enter ZIP");
  });
});
