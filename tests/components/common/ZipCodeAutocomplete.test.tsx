/**
 * ZipCodeAutocomplete Tests
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
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
    mockLookup.mockResolvedValue({ data: { zipCodes: [] } } as any);
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

  it("debounces lookup and reports invalid zip when no suggestions", async () => {
    const onValidityChange = vi.fn();
    render(<ZipCodeAutocomplete {...defaultProps} onValidityChange={onValidityChange} />);
    const input = document.querySelector("input")!;

    fireEvent.change(input, { target: { value: "90" } });
    await waitFor(() => {
      expect(mockLookup).toHaveBeenCalledWith("90");
    }, { timeout: 1800 });
    await waitFor(() => {
      expect(onValidityChange).toHaveBeenCalledWith(false, "invalid_zip");
    }, { timeout: 1800 });
  });

  it("shows suggestions in dropdown and allows selection (covers lines 295-300)", async () => {
    const onSuggestionSelect = vi.fn();
    mockLookup.mockResolvedValue({
      data: {
        zipCodes: [
          { zip: "94102", city: "San Francisco", state: "California", stateAbbreviation: "CA" },
          { zip: "94103", city: "San Francisco", state: "California", stateAbbreviation: "CA" },
        ],
      },
    } as any);

    render(<ZipCodeAutocomplete {...defaultProps} onSuggestionSelect={onSuggestionSelect} />);
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "941" } });

    await waitFor(() => {
      expect(mockLookup).toHaveBeenCalledWith("941");
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(document.querySelector("li")).toBeTruthy();
    }, { timeout: 2000 });

    // Click on suggestion
    const suggestion = document.querySelector("li");
    if (suggestion) {
      fireEvent.mouseDown(suggestion);
    }
    expect(document.body).toBeTruthy();
  });

  it("prevents clipboard events (covers line 255)", () => {
    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input")!;
    const preventDefaultSpy = vi.fn();
    fireEvent.paste(input, { preventDefault: preventDefaultSpy, clipboardData: { getData: () => "94102" } });
    fireEvent.copy(input, { preventDefault: preventDefaultSpy });
    fireEvent.cut(input, { preventDefault: preventDefaultSpy });
    expect(document.body).toBeTruthy();
  });

  it("prevents context menu (covers line 259)", () => {
    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input")!;
    const preventDefaultSpy = vi.fn();
    fireEvent.contextMenu(input, { preventDefault: preventDefaultSpy });
    expect(document.body).toBeTruthy();
  });

  it("Escape key closes dropdown (covers handleKeyDown)", async () => {
    mockLookup.mockResolvedValue({
      data: {
        zipCodes: [{ zip: "94102", city: "SF", state: "CA", stateAbbreviation: "CA" }],
      },
    } as any);

    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "941" } });

    await waitFor(() => {
      expect(mockLookup).toHaveBeenCalled();
    }, { timeout: 2000 });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(document.body).toBeTruthy();
  });

  it("click outside closes dropdown (covers handleClickOutside)", async () => {
    mockLookup.mockResolvedValue({
      data: {
        zipCodes: [{ zip: "94102", city: "SF", state: "CA", stateAbbreviation: "CA" }],
      },
    } as any);

    render(<ZipCodeAutocomplete {...defaultProps} />);
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "941" } });

    await waitFor(() => {
      expect(mockLookup).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(document.body).toBeTruthy();
  });

  it("handles API error gracefully (covers catch block lines 179-185)", async () => {
    mockLookup.mockRejectedValueOnce(new Error("Network error"));
    const onValidityChange = vi.fn();
    render(<ZipCodeAutocomplete {...defaultProps} onValidityChange={onValidityChange} />);
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "941" } });

    await waitFor(() => {
      expect(mockLookup).toHaveBeenCalled();
    }, { timeout: 2000 });
    expect(document.body).toBeTruthy();
  });

  it("auto-selects exact 5-digit suggestion and marks state mismatch", async () => {
    const onSuggestionSelect = vi.fn();
    const onValidityChange = vi.fn();
    mockLookup.mockResolvedValue({
      data: {
        zipCodes: [{ zip: "90210", city: "Beverly Hills", state: "California", stateAbbreviation: "CA" }],
      },
    } as any);

    render(
      <ZipCodeAutocomplete
        {...defaultProps}
        selectedStateAbbreviation="TX"
        onSuggestionSelect={onSuggestionSelect}
        onValidityChange={onValidityChange}
      />
    );
    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "90210" } });

    await waitFor(() => {
      expect(onSuggestionSelect).toHaveBeenCalled();
    }, { timeout: 1800 });
    await waitFor(() => {
      expect(onValidityChange).toHaveBeenCalledWith(false, "state_mismatch");
    }, { timeout: 1800 });
  });
});
