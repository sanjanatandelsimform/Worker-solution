# API Contract Changes: Signup Response

**Feature**: `006-signup-flow-enhancements`
**Date**: 2 April 2026
**Endpoint**: `POST /users/create`
**Change Type**: Response shape update (backend already deployed)

---

## Current Contract

### Request (unchanged)

```
POST /users/create
Content-Type: application/json
```

```json
{
  "firstName": "string",
  "lastName": "string",
  "businessName": "string",
  "industry": "string",
  "zipCode": 12345,
  "businessEmail": "string",
  "businessPhone": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

### Previous Response (before this feature)

```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "businessName": "string",
  "industry": "string",
  "zipCode": 12345,
  "businessEmail": "string",
  "businessPhone": "string",
  "emailVerify": false,
  "createdAt": "ISO-date",
  "updatedAt": "ISO-date"
}
```

### Updated Response (this feature)

```json
{
  "status": true,
  "message": "loginSuccess",
  "data": {
    "user": {
      "id": "d9c5f265-76c0-49a8-83d4-cb056b15bc28",
      "firstName": "sanjana",
      "lastName": "tandel",
      "businessName": "test",
      "industry": "42",
      "zipCode": 33131,
      "businessEmail": "sanjanasimform286@yopmail.com",
      "businessPhone": "4242424242",
      "emailVerify": false,
      "createdAt": "2026-04-02T06:44:38.988Z",
      "updatedAt": "2026-04-02T06:44:38.988Z"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

---

## Verification Endpoint (unchanged)

### `POST /verification/verify`

**Request**: Query parameter `?token=<verification-token>`
**Response**: No changes to shape or behaviour.

```json
{
  "message": "string",
  "data": {
    "user": {
      "id": "uuid",
      "businessEmail": "string",
      "emailVerify": true
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

---

## Frontend Type Changes

### New type: `SignupResponse`

```typescript
export interface SignupResponse {
  user: UserAccount;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

### Updated function signature: `signup()`

```typescript
// Before:
export const signup = async (data: RegistrationData): Promise<UserAccount>

// After:
export const signup = async (data: RegistrationData): Promise<SignupResponse>
```

---

## Error Responses (unchanged)

All error responses remain identical:

| Status | Body | Scenario |
|---|---|---|
| 400 | `{ message: "Email already exists" }` | Duplicate email |
| 400 | `{ message: "Validation error" }` | Invalid fields |
| 500 | `{ message: "Internal server error" }` | Server failure |
