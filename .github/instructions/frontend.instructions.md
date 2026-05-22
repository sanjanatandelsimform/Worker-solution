---
applyTo: "src/components/**/*.tsx"
---

# Frontend Component Instructions (React + TypeScript)

These rules apply **only** to React component files under `src/components/**/*.tsx`.

## React Component Rules

### 1. Functional Components Only
- Always use functional components with hooks. Never use class components.
- Every component must have an explicit TypeScript interface for its props.
  ```tsx
  interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }
  
  const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => { ... };
  ```

### 2. Hook Usage
- Extract all reusable stateful logic into custom hooks in `src/hooks/`.
- Keep components lean — move business logic out of JSX render returns.
- Always declare dependencies array in `useEffect`, `useMemo`, and `useCallback`.

### 3. Styling Conventions
- Use CSS Modules (`.module.css`) for component-scoped styles.
- Class names in CSS Modules must use `camelCase`.
- Do not use inline styles except for truly dynamic values (e.g., computed widths).

### 4. Accessibility (a11y)
- All interactive elements (`button`, `input`, `a`) must have accessible labels or `aria-label`.
- Images must include meaningful `alt` attributes.
- Use semantic HTML elements (`<header>`, `<main>`, `<nav>`, `<section>`) where appropriate.

### 5. Component Structure
- Each component file must export exactly one default component.
- Helper functions used only within the component should be defined above the component function, outside the JSX.
- Co-locate component test files: `ComponentName.test.tsx` alongside `ComponentName.tsx`.

### 6. Performance
- Use `React.memo()` for components that receive stable props but re-render frequently.
- Avoid creating new objects or arrays inline in JSX props — memoize them with `useMemo`.
