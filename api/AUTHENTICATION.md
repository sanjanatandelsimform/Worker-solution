# Authentication Module Documentation

## Overview

The authentication module provides secure user authentication using JSON Web Tokens (JWT). It implements a complete auth flow with access tokens, refresh tokens, and token rotation for enhanced security.

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /api/auth/login (credentials)
    API->>Database: Validate credentials
    Database-->>API: User data
    API->>API: Generate access & refresh tokens
    API-->>Client: Tokens + user data
    
    Note over Client: Store tokens securely
    
    Client->>API: GET /api/protected (access token)
    API->>API: Verify access token
    API-->>Client: Protected data
    
    Note over Client: Access token expires
    
    Client->>API: POST /api/auth/refresh (refresh token)
    API->>API: Verify refresh token
    API->>API: Generate new tokens
    API-->>Client: New tokens
```

### Security Features

- **JWT-based authentication**: Stateless, scalable token system
- **Access token expiration**: Short-lived tokens (15 minutes)
- **Refresh token rotation**: Long-lived tokens (7 days) with automatic rotation
- **Password hashing**: bcrypt with salt rounds
- **Token blacklisting**: Invalidate tokens on logout
- **CORS protection**: Configured origins only
- **Input validation**: Zod schemas for all auth endpoints

---

## API Endpoints

### Base URL

```
http://localhost:3001/api/auth
```

### 1. Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```typescript
{
  email: string;      // Valid email format
  password: string;   // Minimum 8 characters
  name: string;       // User's full name
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: string;
    };
    accessToken: string;
    refreshToken: string;
  }
}
```

**Errors:**
- `400` - Invalid input data
- `409` - Email already exists

---

### 2. Login

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      lastLogin: string;
    };
    accessToken: string;
    refreshToken: string;
  }
}
```

**Errors:**
- `400` - Invalid input data
- `401` - Invalid credentials
- `404` - User not found

---

### 3. Refresh Access Token

Generate a new access token using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;  // New refresh token (rotation)
  }
}
```

**Errors:**
- `400` - Missing refresh token
- `401` - Invalid or expired refresh token
- `403` - Token has been revoked

---

### 4. Logout

Invalidate the current refresh token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  message: "Logged out successfully"
}
```

---

### 5. Get Current User

Retrieve authenticated user information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    lastLogin: string;
  }
}
```

**Errors:**
- `401` - Missing or invalid access token
- `403` - Token expired

---

## Code Examples

### 1. User Login

```typescript
import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      'http://localhost:3001/api/auth/login',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Store tokens securely
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
}

// Usage
const result = await login({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

console.log('Logged in as:', result.data.user.email);
```

---

### 2. Token Refresh

```typescript
interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<RefreshResponse>(
      'http://localhost:3001/api/auth/refresh',
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Update stored tokens
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);

    return response.data.data.accessToken;
  } catch (error) {
    // Refresh token is invalid or expired
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Session expired. Please login again.');
  }
}
```

---

### 3. Making Authenticated Requests

```typescript
async function fetchProtectedData<T>(url: string): Promise<T> {
  let accessToken = localStorage.getItem('accessToken');

  try {
    const response = await axios.get<T>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Access token expired, try to refresh
      try {
        accessToken = await refreshAccessToken();
        
        // Retry original request with new token
        const retryResponse = await axios.get<T>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return retryResponse.data;
      } catch (refreshError) {
        // Redirect to login page
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
    }
    throw error;
  }
}

// Usage
const userData = await fetchProtectedData('/api/auth/me');
```

---

### 4. Axios Interceptor for Automatic Token Refresh

```typescript
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        
        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Usage
import api from './api';

async function getUserProfile() {
  const response = await api.get('/api/auth/me');
  return response.data;
}
```

---

### 5. Logout Example

```typescript
async function logout(): Promise<void> {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) {
    return;
  }

  try {
    await axios.post(
      'http://localhost:3001/api/auth/logout',
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    // Always clear local tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}
```

---

## Token Lifecycle

### Access Token
- **Duration**: 15 minutes
- **Storage**: Memory or localStorage (less secure)
- **Use**: Include in `Authorization` header for all protected requests
- **Format**: `Bearer <token>`

### Refresh Token
- **Duration**: 7 days
- **Storage**: httpOnly cookie (recommended) or localStorage
- **Use**: Request new access token when current expires
- **Rotation**: New refresh token issued with each refresh request

---

## Security Best Practices

1. **Store tokens securely**
   - Use httpOnly cookies for refresh tokens (prevents XSS)
   - Store access tokens in memory when possible
   - Never expose tokens in URLs

2. **Implement token rotation**
   - Issue new refresh token on each refresh request
   - Invalidate old refresh token immediately

3. **Use HTTPS in production**
   - All auth endpoints must use HTTPS
   - Prevents token interception

4. **Validate on every request**
   - Verify token signature
   - Check expiration
   - Validate token hasn't been revoked

5. **Handle errors gracefully**
   - Clear tokens on auth failure
   - Redirect to login page
   - Show user-friendly error messages

---

## Environment Variables

Required environment variables for the auth module:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Database (if using token storage)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
```

---

## Error Handling

All authentication endpoints return errors in the following format:

```typescript
{
  success: false;
  error: {
    code: string;         // Error code (e.g., "INVALID_CREDENTIALS")
    message: string;      // Human-readable message
    details?: unknown;    // Additional error details (dev mode only)
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `TOKEN_INVALID` | 401 | Token signature invalid |
| `TOKEN_REVOKED` | 403 | Token has been blacklisted |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `VALIDATION_ERROR` | 400 | Invalid input data |

---

## Testing

### Example Test Cases

```typescript
import request from 'supertest';
import app from '../server';

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
        });

      const { refreshToken } = loginRes.body.data;

      // Use refresh token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });
  });
});
```

---

## Next Steps

To implement this authentication module:

1. **Install dependencies**
   ```bash
   npm install jsonwebtoken bcrypt
   npm install -D @types/jsonwebtoken @types/bcrypt
   ```

2. **Create auth controller** at `api/src/controllers/auth.controller.ts`

3. **Create auth routes** at `api/src/routes/auth.routes.ts`

4. **Add JWT middleware** at `api/src/middleware/auth.middleware.ts`

5. **Update server.ts** to include auth routes

6. **Set up database** models for users and refresh tokens

7. **Configure environment variables**

For implementation guidance, refer to the [API documentation](./README.md) and [error handling guide](./ERROR_HANDLING.md).
