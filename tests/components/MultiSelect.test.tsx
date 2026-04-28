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
});
