# untitledui-project Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-16

## Active Technologies
- TypeScript 5.x with React 19.2.0 + React Hook Form 7.71+, Axios 1.13+, Zod 4.3+, Redux Toolkit 2.11+ (002-industry-api-integration)
- N/A (API-driven dropdown, no local persistence) (002-industry-api-integration)
- TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios 1.13.2, React Hook Form 7.71.1, Zod 4.3.5, Tailwind CSS 4.1.18 (004-assessment-api-persistence)
- Server-side storage via REST API (GET /assessment, POST /assessment/{section}), NO client-side storage (localStorage/sessionStorage explicitly prohibited for assessment data) (004-assessment-api-persistence)
- TypeScript 5.9.3, React 19.2 + @reduxjs/toolkit 2.11.2, axios 1.13.2, react-router-dom 7.12.0 (001-dashboard-api-integration)
- Redux Toolkit for client state management (existing dashboardSlice pattern) (001-dashboard-api-integration)
- TypeScript 5.x, React 19.2 + Axios 1.13 (HTTP), React Router 7.12, Redux Toolkit, React Aria Components, Tailwind CSS 4.1 (001-zipcode-api-integration)
- N/A (no persistence — transient local component state only) (001-zipcode-api-integration)
- TypeScript ~5.9.3, React 19.2, JSX transform `react-jsx` + Vite (rolldown-vite 7.2.5), Axios 1.13.2, Redux Toolkit 2.11.2, react-hook-form 7.71.1, Zod 4.3.5, React Router 7.12.0 (001-zipcode-api-integration)
- N/A — form state managed in-memory by component state + Redux store (001-zipcode-api-integration)
- TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios (via `profileApi.ts` apiClient), @untitledui/icons (002-profile-settings)
- N/A (no client-side storage changes — assessment reset is server-side) (002-profile-settings)
- TypeScript 5.x / React 19 + React Router v7, Redux Toolkit, Tailwind CSS v4, Vite, shadcn/ui primitives (006-signup-flow-enhancements)
- localStorage (key: `"userDetail"`) — existing persistence via `persistAuth()` helper and `store.subscribe()` (006-signup-flow-enhancements)

- TypeScript (strict mode) + React 19.2 + axios 1.13.2, react-hook-form 7.71, zod 4.3, Redux Toolkit 2.11 (not used for assessment state) (001-states-api-integration)
- N/A — assessment state is local React state in `useAssessment` hook; no localStorage or Redux for assessment (001-states-api-integration)
- TypeScript (strict mode) + React 19.2.0 + axios 1.13.2 (HTTP), Vite/rolldown-vite (build), Tailwind CSS 4 (styling) (001-states-api-integration)
- N/A (no client-side persistence for state options) (001-states-api-integration)

- TypeScript with React 19+, strict mode enabled + React Hook Form (form management), Zod (validation), Axios (HTTP client), React Router v6 (navigation), Untitled UI components, Tailwind CSS 4+ (001-auth-business-onboarding)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript with React 19+, strict mode enabled: Follow standard conventions

## Recent Changes
- 006-signup-flow-enhancements: Added TypeScript 5.x / React 19 + React Router v7, Redux Toolkit, Tailwind CSS v4, Vite, shadcn/ui primitives
- 002-profile-settings: Added TypeScript 5.9.3, React 19.2.0 + React Router v7, Redux Toolkit 2.11.2, Axios (via `profileApi.ts` apiClient), @untitledui/icons
- 001-zipcode-api-integration: Added TypeScript ~5.9.3, React 19.2, JSX transform `react-jsx` + Vite (rolldown-vite 7.2.5), Axios 1.13.2, Redux Toolkit 2.11.2, react-hook-form 7.71.1, Zod 4.3.5, React Router 7.12.0


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
