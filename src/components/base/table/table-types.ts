import type { ReactNode } from "react";

export type TableSize = "sm" | "md" | "lg";

export type TableVariant = "default" | "striped" | "bordered" | "compact";

export interface TableColumn<T = unknown> {
  key: string;
  header: ReactNode;
  render?: (item: T, value: unknown) => ReactNode;
  width?: string;
  className?: string;
  sortable?: boolean;
}
