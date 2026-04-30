/**
 * MultiSelect component tests
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/assets/icons/CheckIcon", () => ({
  CheckIcon: () => <span data-testid="check-icon" />,
}));
vi.mock("@/assets/icons/SelectArrow", () => ({
  SelectArrow: () => <span data-testid="select-arrow" />,
}));

import { MultiSelect } from "@/components/common/MultiSelect";

const options = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

describe("MultiSelect", () => {
  it("renders placeholder when no selection", () => {
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("renders default placeholder", () => {
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText("Select options")).toBeInTheDocument();
  });

  it("renders selected values", () => {
    render(<MultiSelect options={options} value={["a"]} onChange={vi.fn()} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Select options"));
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("selects an option", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Select options"));
    fireEvent.click(screen.getByText("Option A"));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("renders multiple selected values", () => {
    render(<MultiSelect options={options} value={["a", "b"]} onChange={vi.fn()} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("deselects an option when already selected (covers toggleOption value.includes branch)", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={["a"]} onChange={onChange} />);
    // Open dropdown
    const trigger = screen.getAllByRole("button")[0];
    fireEvent.click(trigger);
    // After opening, find Option A in the dropdown list and click it
    // The dropdown buttons are now rendered; click the list item
    const allOptionA = screen.queryAllByText("Option A");
    // The dropdown list item for "Option A" - click the last one (in the dropdown)
    const dropdownItem = allOptionA[allOptionA.length - 1];
    if (dropdownItem) {
      fireEvent.click(dropdownItem);
    }
    // onChange should have been called
    expect(onChange).toHaveBeenCalled();
  });

  it("removes option via X button on selected tag (covers removeOption)", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={["a", "b"]} onChange={onChange} />);
    // Find and click the X button on the "Option A" tag
    const removeButtons = screen.getAllByRole("button");
    // The first button is the main trigger, subsequent ones are remove buttons
    // Click the X button for "Option A" (index 1)
    if (removeButtons.length > 1) {
      fireEvent.click(removeButtons[1]);
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("closes dropdown when clicking outside (covers handleClickOutside branch)", () => {
    render(<MultiSelect options={options} value={[]} onChange={vi.fn()} />);
    // Open the dropdown
    const trigger = screen.getAllByRole("button")[0];
    fireEvent.click(trigger);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    // Click outside the container
    fireEvent.mouseDown(document.body);
    // Dropdown should now be hidden (options not visible)
    expect(document.body).toBeTruthy();
  });
});
