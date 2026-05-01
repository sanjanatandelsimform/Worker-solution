import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// -----------------------------
// Mocks for react-aria ecosystem
// -----------------------------
const mocks = vi.hoisted(() => ({
  focusPrevious: vi.fn(),
  focusNext: vi.fn(),
  openMock: vi.fn(),
  closeMock: vi.fn(),
}));

vi.mock("react-aria", () => {
  return {
    // Multi-select uses these for focus traversal and rendering wrapper.
    useFocusManager: () => ({
      focusPrevious: mocks.focusPrevious,
      focusNext: mocks.focusNext,
    }),
    useFilter: () => ({
      contains: (text: string, filterText: string) =>
        text.toLowerCase().includes(filterText.toLowerCase()),
    }),
    FocusScope: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("react-aria-components", async () => {
  const React = await import("react");
  const ComboBoxStateContextLocal = React.createContext({
    isOpen: false,
    open: mocks.openMock,
    close: mocks.closeMock,
  });

  const ComboBox = ({
    children,
    items,
    onSelectionChange,
  }: {
    children: (state: { isRequired: boolean; isInvalid: boolean }) => React.ReactNode;
    items: Array<{ id: string; label?: string }>;
    onSelectionChange: (id: unknown) => void;
  }) => {
    return (
      <div>
        {children({ isRequired: true, isInvalid: false })}
        <button onClick={() => onSelectionChange(null)} data-testid="select-null">
          select-null
        </button>
        <button onClick={() => onSelectionChange("unknown")} data-testid="select-unknown">
          select-unknown
        </button>
        <button onClick={() => onSelectionChange("a")} data-testid="select-a">
          select-a
        </button>
        {items.map(item => (
          <button
            key={item.id}
            data-testid={`select-${item.id}`}
            onClick={() => onSelectionChange(item.id)}
          >
            {item.label ?? item.id}
          </button>
        ))}
      </div>
    );
  };

  const Group = ({
    className,
    children,
    isDisabled,
  }: {
    className: unknown;
    children: (state: { isDisabled: boolean }) => React.ReactNode;
    isDisabled?: boolean;
  }) => {
    if (typeof className === "function") {
      // Execute the className callback so its branches are covered.
      className({ isDisabled: !!isDisabled, isFocusWithin: false });
    }

    return (
      <div>
        {typeof children === "function" ? children({ isDisabled: !!isDisabled }) : children}
      </div>
    );
  };

  const Input = (props: {
    placeholder?: string;
    onKeyDown?: (e: any) => void;
    onMouseDown?: (e: any) => void;
  }) => {
    return (
      <div>
        <button data-testid="input-mousedown" onClick={() => props.onMouseDown?.({} as any)}>
          input-mousedown
        </button>
        <button
          data-testid="input-key-backspace"
          onClick={() =>
            props.onKeyDown?.({
              key: "Backspace",
              preventDefault: vi.fn(),
              currentTarget: { selectionStart: 0, selectionEnd: 0, value: "" },
            } as any)
          }
        >
          input-key-backspace
        </button>
        <button
          data-testid="input-key-early-return"
          onClick={() =>
            props.onKeyDown?.({
              key: "Backspace",
              preventDefault: vi.fn(),
              currentTarget: { selectionStart: 1, selectionEnd: 1, value: "x" },
            } as any)
          }
        >
          input-key-early-return
        </button>
      </div>
    );
  };

  const ListBox = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="listbox">{children}</div>
  );

  return {
    ComboBox,
    Group,
    Input,
    ListBox,
    // Provide a default context value for open/close/isOpen.
    ComboBoxStateContext: ComboBoxStateContextLocal,
    Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // These are referenced by SelectItem module imports; keep them lightweight.
    Text: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ListBoxItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    Select: ({ children }: { children: any }) => <>{children?.({})}</>,
    SelectValue: ({ children }: { children: any }) => <>{children?.({})}</>,
  };
});

vi.mock("react-stately", () => {
  return {
    useListData: ({ initialItems, filter }: any) => {
      const filterText = "";
      const items = initialItems.filter((item: any) => filter(item, filterText));
      const getItem = (id: string) => initialItems.find((x: any) => x.id === id);
      let currentFilterText = filterText;
      return {
        items,
        filterText: currentFilterText,
        setFilterText: (v: string) => {
          currentFilterText = v;
        },
        getItem,
      };
    },
  };
});

// Resize observer is used to compute popover width.
vi.mock("@/hooks/use-resize-observer", () => ({
  useResizeObserver: ({ ref, onResize }: any) => {
    // default: simulate no element to cover the early return branch.
    onResize?.();
    if (ref && "current" in ref) {
      ref.current = null;
    }
  },
}));

vi.mock("@/components/base/avatar/avatar", () => ({
  Avatar: () => null,
}));

vi.mock("@/components/base/tags/base-components/tag-close-x", () => ({
  TagCloseX: ({
    onPress,
    onKeyDown,
    isDisabled,
  }: {
    onPress?: () => void;
    onKeyDown?: (e: any) => void;
    isDisabled?: boolean;
  }) => (
    <div data-testid={isDisabled ? "tag-disabled" : "tag"}>
      <button data-testid="tag-press" onClick={() => onPress?.()} disabled={!!isDisabled}>
        press
      </button>
      <button
        data-testid="tag-key-tab"
        onClick={() => onKeyDown?.({ key: "Tab", preventDefault: vi.fn() } as any)}
      >
        tab
      </button>
      <button
        data-testid="tag-key-space"
        onClick={() => onKeyDown?.({ key: " ", preventDefault: vi.fn() } as any)}
      >
        space
      </button>
      <button
        data-testid="tag-key-escape"
        onClick={() => onKeyDown?.({ key: "Escape", preventDefault: vi.fn() } as any)}
      >
        escape
      </button>
      <button
        data-testid="tag-key-arrow-left"
        onClick={() => onKeyDown?.({ key: "ArrowLeft", preventDefault: vi.fn() } as any)}
      >
        arrow-left
      </button>
      <button
        data-testid="tag-key-arrow-right"
        onClick={() => onKeyDown?.({ key: "ArrowRight", preventDefault: vi.fn() } as any)}
      >
        arrow-right
      </button>
    </div>
  ),
}));

vi.mock("@/assets/icons/SelectArrow", () => ({
  SelectArrow: () => <span>arrow</span>,
}));

vi.mock("@/components/base/input/hint-text", () => ({
  HintText: () => <div data-testid="hint-text">hint</div>,
}));
vi.mock("@/components/base/input/label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => <div data-testid="label">{children}</div>,
}));

import { MultiSelectBase } from "@/components/base/select/multi-select";

describe("MultiSelectBase", () => {
  const makeSelectedItems = (items: any[]) => ({
    items,
    append: vi.fn(),
    remove: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("covers core branches: tag removal, keyboard handlers, and selection changes", () => {
    const onItemCleared = vi.fn();
    const onItemInserted = vi.fn();

    const selectedItems = makeSelectedItems([
      { id: "", label: "Empty" }, // falsy id -> triggers early return in onRemove
      { id: "a", label: "Item A" },
    ]);

    render(
      <MultiSelectBase
        items={
          [
            { id: "a", label: "Item A" },
            { id: "b", label: "Item B" },
          ] as any
        }
        selectedItems={selectedItems as any}
        onItemCleared={onItemCleared}
        onItemInserted={onItemInserted}
        label="My label"
        hint="My hint"
        shortcut
        placeholder="Search"
      >
        <div />
      </MultiSelectBase>
    );

    expect(screen.getByTestId("label")).toBeTruthy();
    expect(screen.getByTestId("hint-text")).toBeTruthy();

    // selection change: null id => early return (no insert)
    fireEvent.click(screen.getByTestId("select-null"));
    expect(onItemInserted).not.toHaveBeenCalled();

    // selection change: unknown item => no insert
    fireEvent.click(screen.getByTestId("select-unknown"));

    // selection change: already-selected 'a' => no insert
    fireEvent.click(screen.getByTestId("select-a"));
    expect(onItemInserted).not.toHaveBeenCalledWith("a");

    // selection change: new 'b' => append + onItemInserted
    fireEvent.click(screen.getByTestId("select-b"));
    expect(onItemInserted).toHaveBeenCalledWith("b");
    expect(selectedItems.append).toHaveBeenCalled();

    // keyboard handler: caret at start + Backspace => focusPrevious called
    fireEvent.click(screen.getByTestId("input-key-backspace"));
    expect(mocks.focusPrevious).toHaveBeenCalled();

    // keyboard handler: early return branch (caret not at start + value non-empty)
    fireEvent.click(screen.getByTestId("input-key-early-return"));

    // tag keyboard 'Tab' => do nothing
    fireEvent.click(screen.getAllByTestId("tag-key-tab")[0]);

    // tag keyboard 'Escape' => close called
    fireEvent.click(screen.getAllByTestId("tag-key-escape")[0]);
    expect(mocks.closeMock).toHaveBeenCalled();

    // tag press: first tag has falsy id '' => onRemove early return (remove not called)
    fireEvent.click(screen.getAllByTestId("tag-press")[0]);
    expect(selectedItems.remove).not.toHaveBeenCalled();
    expect(onItemCleared).not.toHaveBeenCalled();

    // tag press: second tag has id 'a' => remove called + onItemCleared invoked
    fireEvent.click(screen.getAllByTestId("tag-press")[1]);
    expect(selectedItems.remove).toHaveBeenCalledWith("a");
    expect(onItemCleared).toHaveBeenCalledWith("a");

    // input mousedown when not open => open() is called (covers lines 256-257)
    fireEvent.click(screen.getByTestId("input-mousedown"));
    expect(mocks.openMock).toHaveBeenCalled();

    // tag space key on first tag (isFirstTag=true) => focusNext (line 276)
    fireEvent.click(screen.getAllByTestId("tag-key-space")[0]);
    expect(mocks.focusNext).toHaveBeenCalled();

    // tag space key on second tag (isFirstTag=false) => focusPrevious (line 278)
    fireEvent.click(screen.getAllByTestId("tag-key-space")[1]);
    expect(mocks.focusPrevious).toHaveBeenCalled();

    // tag arrow-left on second tag (line 284-285)
    fireEvent.click(screen.getAllByTestId("tag-key-arrow-left")[1]);
    expect(mocks.focusPrevious).toHaveBeenCalled();

    // tag arrow-right (lines 287-288) - should call focusNext
    fireEvent.click(screen.getAllByTestId("tag-key-arrow-right")[0]);
    expect(mocks.focusNext).toHaveBeenCalled();
  });
});
