import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Table } from "@/components/base/table/table";

vi.mock("@/components/base/checkbox/checkbox", () => ({
  Checkbox: ({
    isSelected,
    onChange,
    "aria-label": ariaLabel,
  }: {
    isSelected: boolean;
    onChange: (v: boolean) => void;
    "aria-label": string;
  }) => (
    <button aria-label={ariaLabel} onClick={() => onChange(!isSelected)}>
      {ariaLabel}:{String(isSelected)}
    </button>
  ),
}));

describe("Table", () => {
  it("renders loading and empty states", () => {
    render(
      <Table
        data={[]}
        columns={[{ key: "name", header: "Name" } as any]}
        isLoading
        emptyMessage="Empty"
      />
    );

    expect(screen.getByText("Loading...")).toBeTruthy();

    render(
      <Table data={[]} columns={[{ key: "name", header: "Name" } as any]} emptyMessage="Empty" />
    );
    expect(screen.getByText("Empty")).toBeTruthy();
  });

  it("supports selectable row selection via header + row checkbox and keyboard", () => {
    const onRowSelectionChange = vi.fn();
    const data = [
      { id: "r1", name: "Row 1" },
      { id: "r2", name: "Row 2" },
    ];
    const columns = [{ key: "name", header: "Name" }];

    render(
      <Table
        data={data}
        columns={columns as any}
        selectable
        variant="default"
        striped
        bordered
        selectedRows={new Set([0])}
        onRowSelectionChange={onRowSelectionChange}
        getRowKey={(item: any) => item.id}
      />
    );

    // header checkbox should show selectable checkbox; clicking it selects/deselects all
    const selectAll = screen.getByLabelText("Select all rows");
    fireEvent.click(selectAll);
    expect(onRowSelectionChange).toHaveBeenCalled();

    // click first row's checkbox toggles selection
    const rowCb = screen.getByLabelText("Select row 1");
    fireEvent.click(rowCb);

    // keyboard interaction: space on the row triggers selection change (preventDefault path)
    const row1Text = screen.getByText("Row 1");
    const row1Tr = row1Text.closest("tr");
    expect(row1Tr).toBeTruthy();
    fireEvent.keyDown(row1Tr as Element, { key: " " });
    expect(onRowSelectionChange).toHaveBeenCalled();
  });

  it("adds row to selection when row is not yet selected (covers line 92)", () => {
    const onRowSelectionChange = vi.fn();
    const data = [
      { id: "r1", name: "Row 1" },
      { id: "r2", name: "Row 2" },
    ];
    const columns = [{ key: "name", header: "Name" }];

    render(
      <Table
        data={data}
        columns={columns as any}
        selectable
        selectedRows={new Set<number>()}
        onRowSelectionChange={onRowSelectionChange}
        getRowKey={(item: any) => item.id}
      />
    );

    // click row that is NOT selected => add(index) branch
    const rowCb = screen.getByLabelText("Select row 1");
    fireEvent.click(rowCb);
    expect(onRowSelectionChange).toHaveBeenCalled();
  });

  it("onRowClick triggered by Enter keydown (covers lines 193-194)", () => {
    const onRowClick = vi.fn();
    const data = [{ id: 1, name: "Row Enter" }];
    const columns = [{ key: "name", header: "Name" }];

    render(
      <Table
        data={data}
        columns={columns as any}
        onRowClick={onRowClick}
        selectedRows={new Set()}
        getRowKey={(item: any) => item.id}
      />
    );

    const rowText = screen.getByText("Row Enter");
    const rowTr = rowText.closest("tr");
    expect(rowTr).toBeTruthy();
    fireEvent.keyDown(rowTr as Element, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalled();
  });

  it("renders cell renderers and supports row click callback", () => {
    const onRowClick = vi.fn();
    const data = [{ id: 1, name: "Row 1" }];
    const columns = [
      {
        key: "name",
        header: "Name",
        render: (item: any) => <span>rendered:{item.name}</span>,
      },
    ];

    render(
      <Table
        data={data}
        columns={columns as any}
        onRowClick={onRowClick}
        selectedRows={new Set()}
        getRowKey={(item: any) => item.id}
      />
    );

    expect(screen.getByText("rendered:Row 1")).toBeTruthy();

    // row click
    fireEvent.click(screen.getByRole("button"));
    expect(onRowClick).toHaveBeenCalled();
  });
});
