# Table Component

A flexible, accessible table component built with React and Tailwind CSS v4.

## Features

- ✅ **Flexible data rendering** - Support for custom render functions per column
- ✅ **Multiple variants** - default, striped, bordered, compact styles
- ✅ **Row selection** - Built-in checkbox selection with multi-select support
- ✅ **Responsive** - Horizontal scrolling on small screens
- ✅ **Accessible** - Full keyboard navigation and ARIA support
- ✅ **Customizable** - Size options, styling, and callbacks
- ✅ **Type-safe** - Full TypeScript support

## Basic Usage

```tsx
import { Table, type TableColumn } from "@/components/base/table";

interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

const users: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
];

const columns: TableColumn<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status" },
];

export function UserTable() {
  return <Table data={users} columns={columns} />;
}
```

## Advanced Usage

### Custom Column Rendering

```tsx
import { Badge } from "@/components/base/badges";

const columns: TableColumn<User>[] = [
  { key: "name", header: "Name", width: "25%" },
  { key: "email", header: "Email", width: "40%" },
  {
    key: "status",
    header: "Status",
    width: "20%",
    render: item => (
      <Badge color={item.status === "active" ? "green" : "gray"}>{item.status}</Badge>
    ),
  },
];
```

### With Row Selection

```tsx
const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

<Table
  data={users}
  columns={columns}
  selectable
  selectedRows={selectedRows}
  onRowSelectionChange={setSelectedRows}
/>;
```

### With Row Click Handling

```tsx
<Table
  data={users}
  columns={columns}
  onRowClick={user => {
    console.log("Row clicked:", user);
  }}
/>
```

### Different Variants and Sizes

```tsx
// Striped variant
<Table data={users} columns={columns} variant="striped" />

// Bordered variant
<Table data={users} columns={columns} variant="bordered" />

// Compact variant with small size
<Table data={users} columns={columns} variant="compact" size="sm" />

// Large format
<Table data={users} columns={columns} size="lg" />
```

### Loading and Empty States

```tsx
<Table
  data={users}
  columns={columns}
  isLoading={isLoading}
  emptyMessage="No users found. Try adjusting your filters."
  caption="User Directory"
/>
```

## Props

### `TableProps<T>`

| Prop                   | Type                                                | Default               | Description                      |
| ---------------------- | --------------------------------------------------- | --------------------- | -------------------------------- |
| `data`                 | `T[]`                                               | Required              | Array of data items to display   |
| `columns`              | `TableColumn<T>[]`                                  | Required              | Column definitions               |
| `size`                 | `"sm" \| "md" \| "lg"`                              | `"md"`                | Table size variant               |
| `variant`              | `"default" \| "striped" \| "bordered" \| "compact"` | `"default"`           | Visual style variant             |
| `getRowKey`            | `(item: T, index: number) => string \| number`      | -                     | Custom key extractor for rows    |
| `onRowClick`           | `(item: T, index: number) => void`                  | -                     | Callback when row is clicked     |
| `className`            | `string`                                            | -                     | Additional CSS class for wrapper |
| `isLoading`            | `boolean`                                           | `false`               | Shows loading state              |
| `emptyMessage`         | `ReactNode`                                         | `"No data available"` | Message when data is empty       |
| `caption`              | `ReactNode`                                         | -                     | Table caption/title              |
| `striped`              | `boolean`                                           | `false`               | Alternate row colors             |
| `bordered`             | `boolean`                                           | `false`               | Show borders                     |
| `selectable`           | `boolean`                                           | `false`               | Enable row selection             |
| `selectedRows`         | `Set<number>`                                       | `new Set()`           | Currently selected row indices   |
| `onRowSelectionChange` | `(selected: Set<number>) => void`                   | -                     | Called when selection changes    |

### `TableColumn<T>`

| Property    | Type                                     | Default  | Description              |
| ----------- | ---------------------------------------- | -------- | ------------------------ |
| `key`       | `string`                                 | Required | Unique column identifier |
| `header`    | `ReactNode`                              | Required | Header display text      |
| `render`    | `(item: T, value: unknown) => ReactNode` | -        | Custom render function   |
| `className` | `string`                                 | -        | Additional CSS classes   |
| `sortable`  | `boolean`                                | -        | Mark column as sortable  |
| `width`     | `string \| number`                       | -        | Column width             |

## Styling

The table component uses Tailwind CSS v4 semantic tokens for colors:

- `bg-background` / `bg-foreground`
- `bg-muted`
- `text-foreground` / `text-muted-foreground`
- `border-border`
- `bg-primary/10`

All Tailwind classes can be customized via your theme configuration.

## Accessibility

- Full keyboard navigation (Tab, Enter, Space)
- ARIA labels on checkboxes and interactive elements
- Semantic HTML with proper heading hierarchy
- High contrast text
- Proper focus indicators
