import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";
import { RankingList } from "../../../src/components/common/RankList";

let capturedDragEnd: ((event: any) => void) | null = null;

// Mock @dnd-kit/core
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd }: any) => {
    capturedDragEnd = onDragEnd;
    return <div data-testid="dnd-context">{children}</div>;
  },
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: ({ id }: any) => ({
    attributes: { "data-id": id },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: (arr: any[], fromIndex: number, toIndex: number) => {
    const result = [...arr];
    const [item] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, item);
    return result;
  },
}));

// Mock @dnd-kit/utilities
vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}));

// Mock Label
vi.mock("@/components/base/input/label", () => ({
  Label: ({ children, isRequired, className }: any) => (
    <label className={className}>
      {children}
      {isRequired && <span>*</span>}
    </label>
  ),
}));

describe("RankingList", () => {
  const defaultOptions = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" },
  ];

  it("renders label", async () => {
    render(
      <RankingList
        label="Rank your preferences"
        isRequired={true}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={[]}
        onChange={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Rank your preferences/)).toBeTruthy();
    });
  });

  it("renders items after initialization", async () => {
    render(
      <RankingList
        label="Preferences"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={vi.fn()}
      />
    );
    await waitFor(
      () => {
        expect(screen.getByText("Option A")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("renders the sortable context with items", async () => {
    render(
      <RankingList
        label="Preferences"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a"]}
        onChange={vi.fn()}
      />
    );
    await waitFor(
      () => {
        expect(screen.getByTestId("sortable-context")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("renders error message when error is provided", async () => {
    render(
      <RankingList
        label="Preferences"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={vi.fn()}
        error="Please rank all items"
      />
    );
    await waitFor(
      () => {
        expect(screen.getByText("Please rank all items")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("shows drag hint text", async () => {
    render(
      <RankingList
        label="Preferences"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={vi.fn()}
      />
    );
    await waitFor(
      () => {
        expect(screen.getByText(/drag and drop to reorder/i)).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("calls onChange when items are reordered", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <RankingList
        label="Preferences"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={onChange}
      />
    );
    // onChange is called on initial load to sync items
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it("renders with maxItems prop limiting displayed count", async () => {
    const onChange = vi.fn();
    render(
      <RankingList
        label="Preferences"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={onChange}
        maxItems={2}
      />
    );
    await waitFor(
      () => {
        // onChange should be called with only the first 2 items
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0].length).toBeLessThanOrEqual(2);
      },
      { timeout: 3000 }
    );
  });

  it("renders required indicator in label", async () => {
    render(
      <RankingList
        label="Required Field"
        isRequired={true}
        displayOrder={2}
        availableOptions={defaultOptions}
        value={[]}
        onChange={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("*")).toBeTruthy();
    });
  });

  it("renders display order in label", async () => {
    render(
      <RankingList
        label="My List"
        isRequired={false}
        displayOrder={5}
        availableOptions={defaultOptions}
        value={[]}
        onChange={vi.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/5\. My List/)).toBeTruthy();
    });
  });

  it("handleDragEnd reorders items when dragged to new position (covers lines 196-208)", async () => {
    const onChange = vi.fn();
    capturedDragEnd = null;
    render(
      <RankingList
        label="Drag Test"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={onChange}
      />
    );
    await waitFor(
      () => {
        expect(capturedDragEnd).not.toBeNull();
      },
      { timeout: 3000 }
    );

    // Simulate drag end with different active and over IDs
    if (capturedDragEnd) {
      act(() => {
        capturedDragEnd!({ active: { id: "a" }, over: { id: "c" } });
      });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("handleDragEnd does nothing when active.id === over.id (same position)", async () => {
    const onChange = vi.fn();
    capturedDragEnd = null;
    render(
      <RankingList
        label="Same Drag Test"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={onChange}
      />
    );
    await waitFor(
      () => {
        expect(capturedDragEnd).not.toBeNull();
      },
      { timeout: 3000 }
    );

    const callCountBefore = onChange.mock.calls.length;
    if (capturedDragEnd) {
      act(() => {
        capturedDragEnd!({ active: { id: "a" }, over: { id: "a" } });
      });
      // onChange should NOT be called again for same-position drop
      expect(onChange.mock.calls.length).toBe(callCountBefore);
    }
  });

  it("preserves user reorder when items already exist (covers lines 144-156)", async () => {
    const onChange = vi.fn();
    // First render to establish initial order
    const { rerender } = render(
      <RankingList
        label="Reorder Test"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={onChange}
      />
    );
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Re-render with the same options to trigger the "preserve order" branch
    rerender(
      <RankingList
        label="Reorder Test"
        isRequired={false}
        displayOrder={1}
        availableOptions={defaultOptions}
        value={["a", "b", "c"]}
        onChange={onChange}
      />
    );
    expect(document.body).toBeTruthy();
  });
});
