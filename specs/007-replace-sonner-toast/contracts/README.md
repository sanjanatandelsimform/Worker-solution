# API Contracts: Replace Sonner Toast with ErrorMessage Component

**Feature**: `007-replace-sonner-toast`

## No API Contract Changes

This feature is a **pure frontend refactor**. It makes no changes to:

- API endpoints (no new routes, no modified routes)
- Request payloads
- Response schemas
- Authentication or authorization

All Finch API calls (`GET /api/v1/finch/session` and `POST /api/v1/finch/exchange`) remain unchanged. The feature only alters how errors from those calls are **surfaced to the user** — through the `<ErrorMessage />` component instead of Sonner toasts.

See [data-model.md](../data-model.md) for the TypeScript interface change to `UseFinchConnectReturn`.
