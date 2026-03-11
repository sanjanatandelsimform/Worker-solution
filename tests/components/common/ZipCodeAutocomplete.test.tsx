import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ZipCodeAutocomplete } from "@/components/common/ZipCodeAutocomplete";
import { lookupZipCodes } from "@/services/api/assessmentApi";
import type { ZipCodeLookupResponse } from "@/types/lookupTypes";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/services/api/assessmentApi", () => ({
  lookupZipCodes: vi.fn(),
}));

const mockedLookup = lookupZipCodes as Mock;

/** Helper: build a successful lookup response */
const makeResponse = (zips: string[]): ZipCodeLookupResponse => ({
  success: true,
  data: {
    zipCodes: zips.map(zip => ({
      zip,
      stateName: "Test",
      stateAbbreviation: "TS",
      stateFips: "00",
    })),
    pagination: { page: 1, limit: 20, totalRecords: zips.length, totalPages: 1 },
  },
  message: "ok",
});

const emptyResponse: ZipCodeLookupResponse = makeResponse([]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// User Story 1 — Core autocomplete behavior
// ---------------------------------------------------------------------------

describe("ZipCodeAutocomplete — US1 core", () => {
  it("renders an input with the provided placeholder", () => {
    render(<ZipCodeAutocomplete value="" onChange={vi.fn()} placeholder="Zip code" />);
    expect(screen.getByPlaceholderText("Zip code")).toBeInTheDocument();
  });

  it("does NOT call lookupZipCodes when fewer than 2 characters are typed", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "3" } });
    rerender(<ZipCodeAutocomplete value="3" onChange={onChange} placeholder="Zip code" />);

    // Advance past debounce
    act(() => vi.advanceTimersByTime(400));

    expect(mockedLookup).not.toHaveBeenCalled();
  });

  it("calls lookupZipCodes after 300ms debounce when 2+ chars typed", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401", "39402"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />
    );

    // Simulate controlled input: user types "39"
    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "39" } });
    rerender(<ZipCodeAutocomplete value="39" onChange={onChange} placeholder="Zip code" />);

    // Before debounce — no call yet
    expect(mockedLookup).not.toHaveBeenCalled();

    // After debounce
    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(mockedLookup).toHaveBeenCalledWith("39");
    });
  });

  it("displays zip code suggestions in a dropdown", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401", "39402"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="39" onChange={onChange} placeholder="Zip code" />
    );

    // Trigger internal input change to start the lookup
    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(<ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
      expect(screen.getByText("39402")).toBeInTheDocument();
    });
  });

  it("populates field and closes dropdown on suggestion click", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="39" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(<ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Clear mock from the earlier onChange("394") call
    onChange.mockClear();

    fireEvent.mouseDown(screen.getByText("39401"));

    expect(onChange).toHaveBeenCalledWith("39401");

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText("39401")).not.toBeInTheDocument();
    });
  });

  it("filters out non-numeric input", async () => {
    const onChange = vi.fn();
    render(<ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />);

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "abc" } });

    // onChange should NOT have been called with non-numeric value
    expect(onChange).not.toHaveBeenCalledWith("abc");
  });

  it("enforces max 5 digit length", async () => {
    const onChange = vi.fn();
    render(<ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />);

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "123456" } });

    // Should not call onChange with > 5 digits
    expect(onChange).not.toHaveBeenCalledWith("123456");
  });
});

// ---------------------------------------------------------------------------
// User Story 2 — Independent instances
// ---------------------------------------------------------------------------

describe("ZipCodeAutocomplete — US2 independence", () => {
  it("two instances operate independently", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["10001"]));

    const onChange1 = vi.fn();
    const onChange2 = vi.fn();

    render(
      <div>
        <ZipCodeAutocomplete value="100" onChange={onChange1} placeholder="Zip 1" />
        <ZipCodeAutocomplete value="" onChange={onChange2} placeholder="Zip 2" />
      </div>
    );

    const input1 = screen.getByPlaceholderText("Zip 1");
    fireEvent.change(input1, { target: { value: "100" } });

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("10001")).toBeInTheDocument();
    });

    // Input 2 should still be empty and have no dropdown
    const input2 = screen.getByPlaceholderText("Zip 2");
    expect(input2).toHaveValue("");
  });

  it("works correctly when mounted/unmounted dynamically", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["20001"]));

    const onChange = vi.fn();
    const { unmount } = render(
      <ZipCodeAutocomplete value="200" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "200" } });

    // Unmount before debounce resolves — should not throw
    unmount();

    act(() => vi.advanceTimersByTime(350));

    // No errors should have been thrown
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// User Story 3 — Loading and empty states
// ---------------------------------------------------------------------------

describe("ZipCodeAutocomplete — US3 loading & empty", () => {
  it("shows loading indicator while API call is pending", async () => {
    // Return an unresolved promise to keep loading state
    mockedLookup.mockReturnValue(new Promise(() => {}));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "39" } });
    rerender(<ZipCodeAutocomplete value="39" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it('shows "No results found" when API returns empty zipCodes array', async () => {
    mockedLookup.mockResolvedValue(emptyResponse);

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "00" } });
    rerender(<ZipCodeAutocomplete value="00" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it('shows "No results found" when API call rejects', async () => {
    mockedLookup.mockRejectedValue(new Error("Network error"));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "99" } });
    rerender(<ZipCodeAutocomplete value="99" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// User Story 4 — Dropdown dismissal
// ---------------------------------------------------------------------------

describe("ZipCodeAutocomplete — US4 dismissal", () => {
  it("closes dropdown when clicking outside the component", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <div>
        <ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />
        <button>Outside</button>
      </div>
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(
      <div>
        <ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />
        <button>Outside</button>
      </div>
    );

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(screen.getByText("Outside"));

    await waitFor(() => {
      expect(screen.queryByText("39401")).not.toBeInTheDocument();
    });
  });

  it("closes dropdown when Escape key is pressed", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(<ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByText("39401")).not.toBeInTheDocument();
    });
  });

  it("does not reopen dropdown after suggestion selection when debounce resolves", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete value="" onChange={onChange} placeholder="Zip code" />
    );

    // Type "394" to trigger lookup
    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(<ZipCodeAutocomplete value="394" onChange={onChange} placeholder="Zip code" />);

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Select the suggestion
    fireEvent.mouseDown(screen.getByText("39401"));

    // Dropdown should close immediately
    await waitFor(() => {
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    // Clear mock to track calls after selection
    mockedLookup.mockClear();

    // Advance timers past debounce window — the selected value "39401"
    // will propagate through useDebounce, but the dropdown must NOT reopen
    act(() => vi.advanceTimersByTime(350));

    // Wait a tick for any async effects to settle
    await waitFor(() => {
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    // No additional API call should have been made for the selected value
    expect(mockedLookup).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// State–ZIP cross-validation
// ---------------------------------------------------------------------------

describe("ZipCodeAutocomplete — state/zip cross-validation", () => {
  it('shows "Zipcode does not match the selected state." when selected state differs from API stateAbbreviation', async () => {
    mockedLookup.mockResolvedValue(
      makeResponse(["39401"]) // stateAbbreviation defaults to "TS" in makeResponse
    );

    const onChange = vi.fn();
    const onSuggestionSelect = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete
        value=""
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="CA"
        onSuggestionSelect={onSuggestionSelect}
      />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(
      <ZipCodeAutocomplete
        value="394"
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="CA"
        onSuggestionSelect={onSuggestionSelect}
      />
    );

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Select the suggestion — stateAbbreviation is "TS", selectedState is "CA"
    fireEvent.mouseDown(screen.getByText("39401"));

    await waitFor(() => {
      expect(screen.getByText("Zipcode does not match the selected state.")).toBeInTheDocument();
    });
  });

  it("does NOT show mismatch error when states match", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete
        value=""
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="TS"
      />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(
      <ZipCodeAutocomplete
        value="394"
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="TS"
      />
    );

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByText("39401"));

    // Error should NOT appear
    await waitFor(() => {
      expect(
        screen.queryByText("Zipcode does not match the selected state.")
      ).not.toBeInTheDocument();
    });
  });

  it("clears mismatch error when user types new input", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete
        value=""
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="CA"
      />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(
      <ZipCodeAutocomplete
        value="394"
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="CA"
      />
    );

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Select mismatched suggestion
    fireEvent.mouseDown(screen.getByText("39401"));

    await waitFor(() => {
      expect(screen.getByText("Zipcode does not match the selected state.")).toBeInTheDocument();
    });

    // Now type a new character — error should clear
    fireEvent.change(input, { target: { value: "3" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Zipcode does not match the selected state.")
      ).not.toBeInTheDocument();
    });
  });

  it("re-validates when selectedStateAbbreviation prop changes after selection", async () => {
    mockedLookup.mockResolvedValue(makeResponse(["39401"]));

    const onChange = vi.fn();
    const { rerender } = render(
      <ZipCodeAutocomplete
        value=""
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="TS"
      />
    );

    const input = screen.getByPlaceholderText("Zip code");
    fireEvent.change(input, { target: { value: "394" } });
    rerender(
      <ZipCodeAutocomplete
        value="394"
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="TS"
      />
    );

    act(() => vi.advanceTimersByTime(350));

    await waitFor(() => {
      expect(screen.getByText("39401")).toBeInTheDocument();
    });

    // Select — should be valid (TS === TS)
    fireEvent.mouseDown(screen.getByText("39401"));

    expect(
      screen.queryByText("Zipcode does not match the selected state.")
    ).not.toBeInTheDocument();

    // Parent changes state to "CA" — should now show mismatch
    rerender(
      <ZipCodeAutocomplete
        value="39401"
        onChange={onChange}
        placeholder="Zip code"
        selectedStateAbbreviation="CA"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Zipcode does not match the selected state.")).toBeInTheDocument();
    });
  });
});
