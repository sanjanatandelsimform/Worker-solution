# GitHub Copilot Instructions

These rules apply globally across the entire codebase.

## Rule 1: TypeScript Strict Mode
- Always use TypeScript with strict mode enabled.
- Prefer explicit type annotations over inferred types for function parameters and return values.
- Never use `any` type; use `unknown` when the type is truly unknown and narrow it appropriately.

## Rule 2: Code Style & Naming Conventions
- Use `camelCase` for variables, functions, and methods.
- Use `PascalCase` for React components, classes, and TypeScript interfaces/types.
- Use `UPPER_SNAKE_CASE` for constants.
- File names for React components must use `PascalCase` (e.g., `UserCard.tsx`).
- File names for utilities, hooks, and helpers must use `camelCase` (e.g., `useAuth.ts`, `formatDate.ts`).

## Rule 3: Error Handling
- All async functions must use try/catch blocks and handle errors explicitly.
- Never silently swallow errors; always log or surface them to the user.
- Use custom error classes for domain-specific errors.

## Rule 4: No Direct DOM Manipulation
- Never use `document.getElementById` or similar DOM APIs directly in React code.
- Use React refs (`useRef`) when DOM access is truly necessary.

## Rule 5: Security
- Never expose API keys, secrets, or credentials in the codebase.
- Always sanitize user inputs before processing or displaying.
- Prefer environment variables (`import.meta.env`) for configuration values.
