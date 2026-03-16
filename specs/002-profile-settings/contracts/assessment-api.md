# API Contract: Retake Assessment

**Feature**: 002-profile-settings  
**Date**: 2026-03-13  
**Status**: Defined

## POST /api/v1/assessment — Retake Assessment

### Description

Initiates a retake of the user's workforce assessment. Resets existing assessment data server-side and prepares a new assessment session. The user is identified via the Bearer token in the Authorization header.

### Request

```http
POST {{baseUrl}}/api/v1/assessment
Content-Type: application/json
Authorization: Bearer {{accessToken}}

{}
```

**Headers**:
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Body**: Empty object `{}` — no user input required.

### Response — 200 OK (Success)

```json
{
  "success": true,
  "message": "Assessment retake initiated successfully"
}
```

Maps to TypeScript type:
```typescript
// Reuses existing ProfileApiResponse from src/types/profileTypes.ts
interface ProfileApiResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}
```

### Response — 401 Unauthorized

Returned when the access token is expired or invalid.

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token expired or invalid"
}
```

**Client behavior**: Existing 401 interceptor in `profileApi.ts` handles token refresh. If refresh also fails, user is redirected to login.

### Response — 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to initiate assessment retake"
}
```

**Client behavior**: Close modal, display error message via `ErrorMessage` component. Auto-retry once via `retryRequest()` wrapper before showing error.

### Integration Notes

- **Client function**: `profileApi.retakeAssessment()` in `src/services/api/profileApi.ts`
- **Redux thunk**: `retakeAssessmentAction` in `src/store/slices/profileSlice.ts`
- **Retry logic**: Uses existing `retryRequest()` wrapper — retries once on network failure
- **Auth**: Uses existing `getAccessToken()` helper to read token from `localStorage.userDetail`
