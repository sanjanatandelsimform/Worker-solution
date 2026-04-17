"use client";

import React, { Fragment, type ReactNode } from "react";
import type { TableColumn, TableSize, TableVariant } from "./table-types";
import { cx } from "@/utils/cx";

/**
 * Table component props
 */
export interface TableProps<T = unknown> {
  /** Array of data to display in the table */
  data: T[];
  /** Array of column definitions */
  columns: TableColumn<T>[];
  /** Size variant of the table */
  size?: TableSize;
  /** Style variant of the table */
  variant?: TableVariant;
  /** Optional row key extractor for keys */
  getRowKey?: (item: T, index: number) => string | number;
  /** Optional callback when a row is clicked */
  onRowClick?: (item: T, index: number) => void;
  /** Optional className for the table wrapper */
  className?: string;
  /** Shows loading state */
  isLoading?: boolean;
  /** Message to show when no data is available */
  emptyMessage?: ReactNode;
  /** Optional caption for the table */
  caption?: ReactNode;
  /** Whether table is striped (alternating row colors) */
  striped?: boolean;
  /** Whether table has borders */
  bordered?: boolean;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Currently selected row indices */
  selectedRows?: Set<number>;
  /** Callback when row selection changes */
  onRowSelectionChange?: (selectedIndices: Set<number>) => void;
}

/**
 * Sizes configuration for different table sizes
 */
const sizeStyles: Record<TableSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * Padding configuration for table cells
 */
const cellPadding: Record<TableSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

/**
 * Variant configuration for tables
 */
const variantStyles: Record<TableVariant, { table: string; row: string; header: string }> = {
  default: {
    table: "",
    row: "",
    header: "bg-muted",
  },
  striped: {
    table: "",
    row: "[&:nth-child(even)]:bg-muted",
    header: "bg-muted",
  },
  bordered: {
    table: "border border-border",
    row: "border-b border-border last:border-b-0",
    header: "border-b-2 border-border bg-muted",
  },
  compact: {
    table: "border-collapse",
    row: "border-b border-border last:border-b-0",
    header: "border-b border-border bg-muted",
  },
};

/**
 * Table component for displaying tabular data
 *
 * @example
 * ```tsx
 * const columns: TableColumn[] = [
 *   { key: 'name', header: 'Name' },
 *   { key: 'email', header: 'Email' },
 *   { key: 'status', header: 'Status', render: (item) => <Badge>{item.status}</Badge> }
 * ];
 *
 * <Table
 *   data={users}
 *   columns={columns}
 *   size="md"
 *   variant="striped"
 * />
 * ```
 */
export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  size = "md",
  variant = "default",
  getRowKey,
  onRowClick,
  className,
  isLoading = false,
  emptyMessage = "No data available",
  caption,
  striped = false,
  bordered = false,
  selectable = false,
  selectedRows = new Set(),
  onRowSelectionChange,
}: TableProps<T>): React.ReactNode {
  // Merge variant with striped/bordered props
  let finalVariant = variant;
  if (striped && variant === "default") finalVariant = "striped";
  if (bordered && variant === "default") finalVariant = "bordered";

  const variantConfig = variantStyles[finalVariant];

  const handleRowClick = (item: T, index: number) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  const handleRowSelectionChange = (index: number) => {
    if (!onRowSelectionChange || !selectable) return;

    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    onRowSelectionChange(newSelected);
  };

  return (
    <div className={cx("overflow-x-auto", className)}>
      <table
        className={cx(
          "w-full border-collapse",
          sizeStyles[size],
          variantConfig.table,
          "text-foreground bg-background"
        )}
      >
        {caption && (
          <caption className="mb-2 text-sm text-muted-foreground text-left">{caption}</caption>
        )}

        <thead>
          <tr className={cx(variantConfig.header)}>
            {selectable && (
              <th
                className={cx(
                  cellPadding[size],
                  "text-left font-semibold text-foreground w-12 border-r border-ws-border-primary"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={e => {
                    if (!onRowSelectionChange || data.length === 0) return;
                    const newSelected = new Set<number>();
                    if ((e.target as HTMLInputElement).checked) {
                      data.forEach((_, index) => {
                        newSelected.add(index);
                      });
                    }
                    onRowSelectionChange(newSelected);
                  }}
                  className="cursor-pointer"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                className={cx(
                  cellPadding[size],
                  "text-base text-left font-medium text-foreground border-r border-ws-border-primary last:border-r-0",
                  column.sortable && "cursor-pointer hover:bg-muted-foreground/10",
                  column.className
                )}
                style={column.width ? { width: `${column.width}` } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cx(
                  cellPadding[size],
                  "text-center text-muted-foreground border-r border-ws-border-primary"
                )}
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cx(
                  cellPadding[size],
                  "text-center text-muted-foreground border-r border-ws-border-primary"
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const rowKey = getRowKey ? getRowKey(item, rowIndex) : rowIndex;
              const isSelected = selectedRows.has(rowIndex);

              return (
                <tr
                  key={rowKey}
                  className={cx(
                    variantConfig.row,
                    "hover:bg-muted/50 transition-colors",
                    onRowClick && "cursor-pointer",
                    isSelected && "bg-primary/10",
                    "text-foreground"
                  )}
                  onClick={() => handleRowClick(item, rowIndex)}
                  role={onRowClick || selectable ? "button" : undefined}
                  tabIndex={onRowClick || selectable ? 0 : undefined}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (selectable && e.key === " ") {
                        e.preventDefault();
                        handleRowSelectionChange(rowIndex);
                      } else if (onRowClick) {
                        handleRowClick(item, rowIndex);
                      }
                    }
                  }}
                >
                  {selectable && (
                    <td className={cx(cellPadding[size], "w-12")}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelectionChange(rowIndex)}
                        className="cursor-pointer"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                      s
                    </td>
                  )}
                  {columns.map(column => {
                    const value = item[column.key];
                    return (
                      <td
                        key={`${rowKey}-${column.key}`}
                        className={cx(
                          cellPadding[size],
                          column.className,
                          "text-foreground border-r border-ws-border-primary border-t border-ws-border-primary last:border-r-0 text-sm"
                        )}
                      >
                        {column.render ? (
                          column.render(item, value)
                        ) : (
                          <Fragment>{String(value ?? "")}</Fragment>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
