import type { ReactNode } from "react";

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
  /** Unique key for the column */
  key: string;
  /** Display header label */
  header: ReactNode;
  /** Function to render cell content */
  render?: (item: T, value: unknown) => ReactNode;
  /** Optional CSS class for column styling */
  className?: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width/flex value */
  width?: string | number;
}

/**
 * Table sort state
 */
export interface TableSortState {
  key: string | null;
  direction: "asc" | "desc";
}

/**
 * Table row styling based on state
 */
export type TableRowVariant = "default" | "hover" | "selected" | "disabled";

/**
 * Available table sizes
 */
export type TableSize = "sm" | "md" | "lg";

/**
 * Available table variants
 */
export type TableVariant = "default" | "striped" | "bordered" | "compact";
