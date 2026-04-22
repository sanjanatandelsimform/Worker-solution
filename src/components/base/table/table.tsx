import React, { Fragment, type ReactNode } from "react";
import type { TableColumn, TableSize, TableVariant } from "./table-types";
import { cx } from "@/utils/cx";
import { Checkbox } from "@/components/base/checkbox/checkbox";

export interface TableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  size?: TableSize;
  variant?: TableVariant;
  getRowKey?: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  isLoading?: boolean;
  emptyMessage?: ReactNode;
  caption?: ReactNode;
  striped?: boolean;
  bordered?: boolean;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onRowSelectionChange?: (selectedIndices: Set<number>) => void;
}

const sizeStyles: Record<TableSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const cellPadding: Record<TableSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

const variantStyles: Record<TableVariant, { table: string; row: string; header: string }> = {
  default: {
    table: "",
    row: "",
    header: "bg-ws-gray-50",
  },
  striped: {
    table: "",
    row: "[&:nth-child(even)]:bg-ws-gray-50",
    header: "bg-ws-gray-50",
  },
  bordered: {
    table: "border border-ws-border-primary",
    row: "border-b border-ws-border-primary last:border-b-0",
    header: "border-b-2 border-ws-border-primary bg-ws-gray-50",
  },
  compact: {
    table: "border-collapse",
    row: "border-b border-ws-border-primary last:border-b-0",
    header: "border-b border-ws-border-primary bg-ws-gray-50",
  },
};

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
  let finalVariant = variant;
  if (striped && variant === "default") finalVariant = "striped";
  if (bordered && variant === "default") finalVariant = "bordered";

  const variantConfig = variantStyles[finalVariant];

  const handleRowClick = (item: T, index: number) => {
    if (onRowClick) onRowClick(item, index);
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
          "text-ws-text-primary bg-ws-base-white"
        )}
      >
        {caption && (
          <caption className="mb-2 text-sm text-ws-text-tertiary text-left">{caption}</caption>
        )}

        <thead>
          <tr className={cx(variantConfig.header)}>
            {selectable && (
              <th
                className={cx(
                  cellPadding[size],
                  "text-left font-semibold text-ws-text-primary w-12 border-r border-ws-border-primary"
                )}
              >
                <Checkbox
                  isSelected={selectedRows.size === data.length && data.length > 0}
                  onChange={(isChecked: boolean) => {
                    if (!onRowSelectionChange || data.length === 0) return;
                    const newSelected = new Set<number>();
                    if (isChecked) {
                      data.forEach((_, index) => newSelected.add(index));
                    }
                    onRowSelectionChange(newSelected);
                  }}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                className={cx(
                  cellPadding[size],
                  "text-base text-left font-medium text-ws-text-primary border-r border-ws-border-primary last:border-r-0",
                  column.sortable && "cursor-pointer hover:bg-ws-gray-100",
                  column.className
                )}
                style={column.width ? { width: column.width } : undefined}
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
                className={cx(cellPadding[size], "text-center text-ws-text-tertiary")}
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={cx(cellPadding[size], "text-center text-ws-text-tertiary")}
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
                    "hover:bg-ws-gray-50 transition-colors",
                    onRowClick && "cursor-pointer",
                    isSelected && "bg-ws-light-teal-50",
                    "text-ws-text-primary"
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
                      <Checkbox
                        isSelected={isSelected}
                        onChange={() => handleRowSelectionChange(rowIndex)}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
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
                          "text-ws-text-primary border-r border-ws-border-primary border-t border-ws-border-primary last:border-r-0 text-sm"
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
