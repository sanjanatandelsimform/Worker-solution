# API Error Handling Test Cases

Test all error scenarios for the `/api/users/register` endpoint.

## 1. ✅ Success Case (201 Created)

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_1716206400000_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-05-20T12:00:00.000Z"
  }
}
```

---

## 2. ❌ Validation Error (400 Bad Request)

### Missing Required Fields
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": {
      "name": ["Name is required"],
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Invalid Email Format
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email format"]
    }
  }
}
```

### Password Too Short
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "short"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": {
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

---

## 3. ❌ Duplicate Email (409 Conflict)

Register the same email twice:

```bash
# First registration - succeeds
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Second registration - fails
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "john@example.com",
    "password": "password456"
  }'
```

**Response (409):**
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists"
  }
}
```

---

## 4. ❌ Server Error (500 Internal Server Error)

If any unexpected error occurs (database failure, network issue, etc.):

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```

**Server logs will include:**
```
❌ Server Error: {
  message: "Error details...",
  stack: "...",
  method: "POST",
  path: "/api/users/register",
  timestamp: "2026-05-20T12:00:00.000Z"
}
```

---

## Error Response Format

All errors follow a consistent JSON structure:

```typescript
{
  success: false,
  error: {
    message: string,           // Human-readable error message
    errors?: {                 // Optional field-specific errors (validation only)
      [fieldName]: string[]    // Array of error messages per field
    }
  }
}
```

## HTTP Status Codes Summary

| Status | Scenario | Response |
|--------|----------|----------|
| **201** | Successful registration | User data returned |
| **400** | Invalid input (validation failed) | Field-specific errors |
| **409** | Duplicate email | Conflict message |
| **500** | Server/unexpected error | Generic error message |

---

## Testing All Cases (Bash Script)

```bash
#!/bin/bash

API="http://localhost:3001/api/users/register"

echo "Test 1: Success Case"
curl -X POST $API -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"test1@example.com","password":"password123"}'
echo -e "\n"

echo "Test 2: Missing Fields"
curl -X POST $API -H "Content-Type: application/json" -d '{}'
echo -e "\n"

echo "Test 3: Invalid Email"
curl -X POST $API -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"invalid","password":"password123"}'
echo -e "\n"

echo "Test 4: Short Password"
curl -X POST $API -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"test2@example.com","password":"short"}'
echo -e "\n"

echo "Test 5: Duplicate Email"
curl -X POST $API -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"test1@example.com","password":"password456"}'
echo -e "\n"
```

Save as `test-errors.sh` and run:
```bash
chmod +x test-errors.sh
./test-errors.sh
```
