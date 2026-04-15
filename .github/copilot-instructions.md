# GitHub Copilot Instructions for SSU Front Three

## Project Overview

React 19 + TypeScript + Vite application with Tailwind CSS v4, shadcn/ui components, and React Router v7. Features a clean login/dashboard architecture with feature-based organization following strict naming conventions.

## Architecture & Key Concepts

### Component Architecture

- **Structure**: Shared + Feature-Based (optimized for shadcn/ui)
- **Component organization**:

  ```
  components/
  ├── ui/           # shadcn generated components (Button, Card, etc.)
  ├── shared/       # Custom shared components (PageLoader, PageNotFound, Header, Footer)
  └── forms/
    └── loginForm.tsx        # Domain-specific forms (LoginForm, ProfileForm)

  features/
  ├── auth/
  │   └── loginCard.tsx
  └── dashboard/
    ├── ChartWidget.tsx
    └── recentActivity.tsx
  ```

- **Why this structure**: shadcn/ui components live in `ui/`, custom reusable components in `shared/`, domain-specific forms in `forms/`, and feature-specific code stays within `features/`

### Routing Architecture

- **Routes defined in**: `src/routes/index.tsx` (NOT `routes.tsx` - must be `.tsx` for JSX)
- **Two layout patterns**: Public (`authLayout.tsx`) and Private (`privateLayout.tsx`)
- **Lazy loading pattern**: All routes use `lazyLoad()` helper with `<Suspense fallback={<PageLoader />}>`
- **Route structure**:
  - `/auth/login` → Public (no auth)
  - `/` and `/dashboard` → Private (requires auth check in `PrivateLayout`)
  - `*` → 404 PageNotFound

### Component Organization

- **Current structure**: Shared + Feature-Based organization (optimized for shadcn/ui)
- **Component categories**:
  - `components/ui/` - shadcn/ui generated components (Button, Card, Input, etc.)
  - `components/shared/` - Custom reusable components (PageLoader, PageNotFound, Header, Footer, Sidebar)
  - `components/forms/` - Domain-specific forms (LoginForm, ProfileForm, RegistrationForm)
  - `features/{feature}/components/` - Feature-specific components (AuthForm, DashboardCard)
- **Pages structure**:
  ```
  pages/
  ├── public/authLayout.tsx + login/index.tsx
  └── private/privateLayout.tsx + dashboard/index.tsx
  ```
- **Barrel exports**: All component folders have `index.ts` for clean imports
- **Component files**: Component + `.test.tsx` co-located (NO CSS Modules - use Tailwind v4 directly)
- **Styling**: Use Tailwind CSS v4 utility classes directly in JSX, NOT CSS Modules

### Theme System

- **Dark mode**: Built-in via `ThemeProvider` (src/lib/theme-provider.tsx)
- **Theme state**: Uses `useTheme` hook from `@/hooks/useTheme`
- **Storage**: localStorage with key `vite-ui-theme`
- **Tailwind v4**: Use utility classes directly in JSX with `@theme` syntax in CSS
- **CSS variables**: Tailwind v4 auto-generates from theme config
- **Semantic classes**: Always use semantic Tailwind classes (e.g., `bg-background`, `text-foreground`, `border-border`)
- **Dark mode**: Use `dark:` variants with semantic colors (e.g., `dark:bg-background`, `dark:text-foreground`)
- **NO arbitrary values**: Avoid hard-coded values like `bg-[#ffffff]` or `text-[14px]` - use theme tokens instead

## Critical Naming Conventions (STRICTLY ENFORCED)

| Type       | Convention              | Example             | Extension   |
| ---------- | ----------------------- | ------------------- | ----------- |
| Folders    | kebab-case              | `user-profile/`     | N/A         |
| Components | PascalCase              | `UserCard.tsx`      | `.tsx`      |
| Hooks      | camelCase + "use"       | `useAuth.ts`        | `.ts`       |
| Context    | PascalCase + "Context"  | `AuthContext.tsx`   | `.tsx`      |
| Services   | camelCase + "Service"   | `authService.ts`    | `.ts`       |
| Utils      | camelCase               | `dateFormatter.ts`  | `.ts`       |
| Types      | camelCase + "Types"     | `authTypes.ts`      | `.ts`       |
| Tests      | Component + `.test.tsx` | `UserCard.test.tsx` | `.test.tsx` |

**Critical**:

- JSX requires `.tsx` extension. Routes file MUST be `.tsx`, not `.ts`.
- NO CSS Modules (`.module.css`) - Use Tailwind v4 utility classes directly in JSX
- NO arbitrary values - Always use semantic Tailwind classes from theme (e.g., `bg-background`, not `bg-[#fff]`)

## Import Patterns

### Path Aliases (configured in tsconfig.json)

```typescript
import { Button } from "@/components/atoms";
import { useAuth } from "@/features/auth/hooks";
import { routes } from "@/routes"; // Note: NOT "./routes" - use alias
```

# Copilot instructions — SSU Front Three (condensed)

This file gives the short, actionable patterns an AI coding agent needs to be productive in this repo.

Key facts (quick): React 19 + TypeScript + Vite, Tailwind v4, shadcn/ui, React Router v7. Path alias `@/*` -> `src/*`.

Do this first when editing code:

- Open `src/routes/index.tsx` to follow the lazy-load + Suspense pattern (helper: `lazyLoad(Component)`).
- Use barrel exports (feature `index.ts`) and the `@/` alias for imports (never relative `../..` for src files).

## Active Feature: 010-refactor-workforce-page (2026-04-15)

<!-- specify:agent:start -->

**Branch**: `009-workforce-tab-api` | **Spec**: `specs/010-refactor-workforce-page/spec.md` | **Plan**: `specs/010-refactor-workforce-page/plan.md`

### Context: Previous feature (009-workforce-tab-api) is complete

All files from feature 009 are already implemented: `workforceTypes.ts`, `workforceApi.ts`, `workforceSlice.ts`, `workforceSelectors.ts`, Redux store wired, `WorkforcePage.tsx` consuming Redux data.

### What this feature does

Pure structural refactoring — splits the ~1,100-line `WorkforcePage.tsx` into 6 co-located modules. **Zero behavioral or visual changes.**

### New files to create (all in `src/pages/workforce/`)

- `workforceUtils.ts` — exports `parsePercentage(value: string): number` helper
- `WorkforceSkeletons.tsx` — named exports for all 8 skeleton loading components
- `WorkforceOverview.tsx` — 4 overview stat cards + "Did you know?" banner (default export)
- `WorkforceParticipation.tsx` — participation count cards + Benefits/Retirement/Insurance progress rows (default export)
- `WorkforceDemographics.tsx` — gender cards, employment type donut charts, age breakdown (default export)
- `WorkforceCompensation.tsx` — salary stats, workforce breakdown table, benefits cost section, salary chart (default export)

### Files to edit

- `src/pages/workforce/WorkforcePage.tsx` — trim to < 150 lines: keep all `useState`, all `useAppSelector` calls, all config array computations, page header, error banner, footer disclaimer, `<GetInTouchModal>`; replace section JSX blocks with the 4 new section components

### Key patterns

- **Section components are purely presentational** — no Redux imports inside them; parent computes all config arrays and passes as typed props
- **`parsePercentage`** lives in `src/pages/workforce/workforceUtils.ts`; imported by `WorkforcePage` only
- **`employmentTypeItems`** (static `[fullTime, partTime, seasonal]`) defined as module-level const inside `WorkforceDemographics.tsx`
- **`isGetInTouchModalOpen`** state + `<GetInTouchModal>` render stays in `WorkforcePage.tsx` (no trigger button currently, but preserved for future use)
- **Skeleton components** are named exports from `WorkforceSkeletons.tsx`; imported by section files
- See full prop interface contracts: `specs/010-refactor-workforce-page/data-model.md`
- See step-by-step implementation guide: `specs/010-refactor-workforce-page/quickstart.md`
<!-- specify:agent:end -->

Essential files to reference in PRs or fixes:

- Routing: `src/routes/index.tsx` (AuthLayout / PrivateLayout, PageLoader fallback)
- Theme: `src/lib/theme-provider.tsx` and `src/hooks/useTheme.ts` (storage key: `vite-ui-theme`)
- Shared UI: `src/components/shared/PageLoader.tsx`, `PageNotFound.tsx`, `ErrorBoundary.tsx`
- Features: `src/features/*` (each feature contains component files directly and a root `index.ts` barrel). Feature-specific hooks should be placed in `src/hooks/` rather than inside feature folders.

Conventions an agent must follow:

- Files with JSX must be `.tsx` (routes file MUST be `src/routes/index.tsx`).
- Folders: kebab-case. Components: PascalCase and exported from a barrel. Hooks: camelCase prefixed with `use`.
- Styling: Tailwind v4 semantic tokens only (e.g. `bg-background`, `text-muted-foreground`). No CSS Modules, avoid arbitrary values like `bg-[#fff]`.
- Exports: prefer default exports for page components (lazy imports rely on them) and named/barrel exports for features.

Developer workflows and commands (from `package.json`):

- pnpm dev — start Vite dev server
- pnpm run build — run `tsc -b` then `vite build`
- pnpm run type-check — `tsc --noEmit`
- pnpm lint:fix — ESLint auto-fix
- pnpm format — Prettier

Repo-specific quirks and gotchas (documented from code):

- Routing helper: `lazyLoad(Component)` wraps lazy imports with `<Suspense fallback={<PageLoader/>}>` (see `src/routes/index.tsx`).
- Theme is driven by `ThemeProvider` which toggles `light`/`dark` on `document.documentElement` and persists to `localStorage` under `vite-ui-theme`.
- Barrel export example: `src/features/auth/index.ts` exports `LoginForm` from `LoginForm.tsx` — import via `import { LoginForm } from "@/features/auth"`.
- Husky + lint-staged are configured (`prepare` script + `lint-staged` in package.json). Staged TS/TSX files run `eslint --fix` + `prettier --write`.

When making changes, run this quick quality gate locally and report results in PR:

1. pnpm run type-check (must pass)
2. pnpm lint:fix then pnpm format
3. Start dev server `pnpm dev` and smoke-test the route you changed (the app uses client-side routing — check `/auth/login` and `/dashboard`).

If you need to add UI primitives use `pnpm dlx shadcn@latest add <component>`; components land in `src/components/ui/` and should be wired into barrels.

If anything in this file is unclear or you want more examples (small PR snippets), tell me which area to expand (routing, theme, feature pattern, or build/test flows).
