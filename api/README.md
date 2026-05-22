# User Registration API

REST API server built with Express.js and TypeScript for user registration.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📋 API Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-20T12:00:00.000Z"
}
```

### User Registration
```
POST /api/users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `name`: Required, must be a string
- `email`: Required, must be valid email format
- `password`: Required, minimum 8 characters

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user_1716206400000_abc123",
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2026-05-20T12:00:00.000Z"
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

**Error Response (409 - User Exists):**
```json
{
  "success": false,
  "error": {
    "message": "User with this email already exists"
  }
}
```

**Error Response (500 - Server Error):**
```json
{
  "success": false,
  "error": {
    "message": "Internal server error"
  }
}
```

> 📖 **See [ERROR_HANDLING.md](ERROR_HANDLING.md) for comprehensive error testing examples**

## 🧪 Testing with cURL

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

## 📁 Project Structure

```
api/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── types/           # TypeScript interfaces
│   ├── middleware/      # Express middleware (error handling)
│   ├── utils/           # Validation & helpers
│   └── server.ts        # Express app setup
├── package.json
├── tsconfig.json
├── README.md
├── ERROR_HANDLING.md    # Comprehensive error testing guide
└── .env.example
```

## 🛡️ Error Handling

The API implements comprehensive error handling with proper HTTP status codes:

| Status Code | Scenario | Description |
|-------------|----------|-------------|
| **201** | Success | User registered successfully |
| **400** | Bad Request | Validation failed (missing/invalid fields) |
| **409** | Conflict | Email already registered |
| **500** | Server Error | Unexpected server error |

All responses follow a consistent JSON format with:
- `success` boolean flag
- `data` object (on success) or `error` object (on failure)
- Field-specific validation errors when applicable
- Detailed server-side logging for debugging

See [ERROR_HANDLING.md](ERROR_HANDLING.md) for complete test cases and examples.

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run docs` - Generate HTML documentation from JSDoc comments

## 📚 Documentation

### Type Definitions & JSDoc

All TypeScript interfaces and functions include comprehensive JSDoc comments for:
- Better IDE IntelliSense support
- Inline documentation
- Type safety
- API reference

**View the complete documentation:**
- [JSDOC_DOCUMENTATION.md](JSDOC_DOCUMENTATION.md) - Full JSDoc and TypeScript interface reference
- [ERROR_HANDLING.md](ERROR_HANDLING.md) - Error handling test cases

**Generate HTML docs:**
```bash
npm install  # Install typedoc
npm run docs # Generate docs in docs/ folder
```

## 🔒 Security Notes

- Passwords are validated but NOT hashed (add bcrypt for production)
- No JWT/session management (add authentication for production)
- Uses in-memory storage (integrate a real database for production)
- Add rate limiting for production use

## 🚧 Production Checklist

- [ ] Add password hashing (bcrypt)
- [ ] Implement JWT authentication
- [ ] Connect to database (PostgreSQL, MongoDB, etc.)
- [ ] Add rate limiting
- [ ] Implement logging
- [ ] Add unit tests
- [ ] Set up HTTPS
- [ ] Add API documentation (Swagger/OpenAPI)
