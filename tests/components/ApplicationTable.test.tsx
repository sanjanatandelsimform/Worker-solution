/**
 * Application Table Component Tests
 *
 * Covers: TableCard.Root, TableCard.Header, TableRowActionsDropdown,
 * Table (Root + Header + Body + Row + Cell + Head), and size variants.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";

// ── Mocks for heavy base-component dependencies ───────────────────────────────

vi.mock("@/components/base/badges/badges", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("@/components/base/checkbox/checkbox", () => ({
  Checkbox: () => <input type="checkbox" data-testid="checkbox" />,
  CheckboxBase: ({ isSelected }: { isSelected?: boolean }) => (
    <input type="checkbox" data-testid="checkbox-base" defaultChecked={isSelected} />
  ),
}));

vi.mock("@/components/base/tooltip/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// ── TableCard.Root ─────────────────────────────────────────────────────────────

describe("TableCard.Root", () => {
  it("renders its children", () => {
    render(
      <TableCard.Root>
        <span data-testid="child">content</span>
      </TableCard.Root>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders as a div", () => {
    const { container } = render(<TableCard.Root>body</TableCard.Root>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("applies overflow-hidden and rounded-xl classes", () => {
    const { container } = render(<TableCard.Root>body</TableCard.Root>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("overflow-hidden");
    expect(el.className).toContain("rounded-xl");
  });

  it("merges a custom className", () => {
    const { container } = render(<TableCard.Root className="my-card">body</TableCard.Root>);
    expect((container.firstChild as HTMLElement).className).toContain("my-card");
  });

  it("renders at size 'sm' without error", () => {
    render(<TableCard.Root size="sm">content</TableCard.Root>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders at size 'md' (default) without error", () => {
    render(<TableCard.Root size="md">content</TableCard.Root>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

// ── TableCard.Header ──────────────────────────────────────────────────────────

describe("TableCard.Header", () => {
  it("renders the title", () => {
    render(
      <TableCard.Root>
        <TableCard.Header title="Users" />
      </TableCard.Root>
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("renders a string badge inside a Badge component", () => {
    render(
      <TableCard.Root>
        <TableCard.Header title="Orders" badge="New" />
      </TableCard.Root>
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
    expect(screen.getByTestId("badge").textContent).toBe("New");
  });

  it("renders a ReactNode badge as-is (skips Badge wrapper)", () => {
    render(
      <TableCard.Root>
        <TableCard.Header title="Orders" badge={<span data-testid="custom-badge">VIP</span>} />
      </TableCard.Root>
    );
    expect(screen.getByTestId("custom-badge")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <TableCard.Root>
        <TableCard.Header title="Users" description="All registered users" />
      </TableCard.Root>
    );
    expect(screen.getByText("All registered users")).toBeInTheDocument();
  });

  it("does not render a description element when omitted", () => {
    render(
      <TableCard.Root>
        <TableCard.Header title="Users" />
      </TableCard.Root>
    );
    expect(screen.queryByText("All registered users")).toBeNull();
  });

  it("renders contentTrailing when provided", () => {
    render(
      <TableCard.Root>
        <TableCard.Header
          title="Users"
          contentTrailing={<button data-testid="trailing-btn">Export</button>}
        />
      </TableCard.Root>
    );
    expect(screen.getByTestId("trailing-btn")).toBeInTheDocument();
  });

  it("merges a custom className", () => {
    const { container } = render(
      <TableCard.Root>
        <TableCard.Header title="Users" className="custom-header" />
      </TableCard.Root>
    );
    // The header div is the first child of the card root
    const header = container.querySelector(".custom-header");
    expect(header).not.toBeNull();
  });
});

// ── TableRowActionsDropdown ───────────────────────────────────────────────────

describe("TableRowActionsDropdown", () => {
  it("renders the DotsButton trigger", () => {
    render(<TableRowActionsDropdown />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("shows Edit, Copy link, and Delete items when opened", async () => {
    render(<TableRowActionsDropdown />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    });
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument();
  });
});

// ── Table (full structure) ─────────────────────────────────────────────────────

/**
 * Minimal helper for rendering a Table with one header column and one data row.
 */
const renderBasicTable = (tableProps = {}) =>
  render(
    <Table aria-label="Test table" selectionMode="none" {...tableProps}>
      <Table.Header>
        <Table.Head id="name" label="Name" />
        <Table.Head id="role" label="Role" />
      </Table.Header>
      <Table.Body>
        <Table.Row id="r1">
          <Table.Cell>Alice</Table.Cell>
          <Table.Cell>Admin</Table.Cell>
        </Table.Row>
        <Table.Row id="r2">
          <Table.Cell>Bob</Table.Cell>
          <Table.Cell>User</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );

describe("Table", () => {
  describe("structure", () => {
    it("renders a table element (role='grid')", () => {
      renderBasicTable();
      expect(screen.getByRole("grid", { name: "Test table" })).toBeInTheDocument();
    });

    it("renders column headers", () => {
      renderBasicTable();
      expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Role" })).toBeInTheDocument();
    });

    it("renders data rows", () => {
      renderBasicTable();
      expect(screen.getAllByRole("row").length).toBeGreaterThanOrEqual(3); // 1 header + 2 data
    });

    it("renders cell content", () => {
      renderBasicTable();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("User")).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    it("renders at size 'sm' without error", () => {
      render(
        <Table aria-label="Small table" selectionMode="none" size="sm">
          <Table.Header>
            <Table.Head id="name-sm" label="Name" />
          </Table.Header>
          <Table.Body>
            <Table.Row id="r1-sm">
              <Table.Cell>Alice</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      );
      expect(screen.getByRole("grid", { name: "Small table" })).toBeInTheDocument();
    });

    it("renders at size 'md' (default) without error", () => {
      render(
        <Table aria-label="Medium table" selectionMode="none" size="md">
          <Table.Header>
            <Table.Head id="name-md" label="Name" />
          </Table.Header>
          <Table.Body>
            <Table.Row id="r1-md">
              <Table.Cell>Bob</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      );
      expect(screen.getByRole("grid", { name: "Medium table" })).toBeInTheDocument();
    });
  });

  describe("TableCard + Table integration", () => {
    it("renders table inside a TableCard without errors", () => {
      render(
        <TableCard.Root>
          <TableCard.Header title="Employees" description="Active employees" />
          <Table aria-label="Employees table" selectionMode="none">
            <Table.Header>
              <Table.Head id="emp-name" label="Name" />
            </Table.Header>
            <Table.Body>
              <Table.Row id="emp-r1">
                <Table.Cell>Carol</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </TableCard.Root>
      );
      expect(screen.getByText("Employees")).toBeInTheDocument();
      expect(screen.getByText("Active employees")).toBeInTheDocument();
      expect(screen.getByRole("grid", { name: "Employees table" })).toBeInTheDocument();
      expect(screen.getByText("Carol")).toBeInTheDocument();
    });
  });

  describe("Table.Head tooltip", () => {
    it("renders a tooltip-enabled column head without error", () => {
      render(
        <Table aria-label="Tip table" selectionMode="none">
          <Table.Header>
            <Table.Head id="score" label="Score" tooltip="Higher is better" />
          </Table.Header>
          <Table.Body>
            <Table.Row id="rt1">
              <Table.Cell>95</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      );
      expect(screen.getByRole("columnheader", { name: "Score" })).toBeInTheDocument();
    });
  });

  describe("empty table body", () => {
    it("renders an empty table without errors", () => {
      render(
        <Table aria-label="Empty table" selectionMode="none">
          <Table.Header>
            <Table.Head id="empty-col" label="Name" />
          </Table.Header>
          <Table.Body>{[]}</Table.Body>
        </Table>
      );
      expect(screen.getByRole("grid", { name: "Empty table" })).toBeInTheDocument();
    });
  });
});
