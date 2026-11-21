# Authentication Service

This directory contains the authentication and authorization services for the Lumaris platform. It handles user authentication, session management, token validation, and security features like Turnstile CAPTCHA verification.

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Available Modules](#-available-modules)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [Token Management](#-token-management)
- [Development Guidelines](#-development-guidelines)

---

## 🎯 Overview

The authentication service provides a comprehensive security layer for the Lumaris platform, using custom JWT tokens issued by login-client-worker and Cloudflare Turnstile for bot protection. The service handles:

- **User Authentication**: Login, logout, and session management
- **Token Management**: JWT token generation and validation
- **Security**: CAPTCHA verification and rate limiting
- **Session Handling**: Secure session token management
- **Authorization**: Access control and permission checks

### Security Architecture

The authentication system uses a custom JWT approach:

1. **One-Time Token**: Short-lived token for initial authentication
2. **JWT Token**: Long-lived token issued by login-client-worker
3. **Service Binding**: Secure communication between workers

This provides enhanced security by limiting the exposure of credentials.

---

## 🏗️ Architecture

### Authentication Flow

```
1. User Login → login-client-worker (with Turnstile)
2. One-Time Token → Client receives token
3. Token Exchange → Client sends token to /api/auth/exchange
4. JWT Issuance → login-client-worker issues JWT
5. API Calls → Client uses JWT for API requests
6. JWT Renewal → Automatic renewal every 10 minutes
```

### Module Structure

```
auth/
├── index.js          # Main authentication API handler
├── session.js        # Session token management
└── encoding.js       # Encoding utilities
```

---

## 📦 Available Modules

### Main Handler (`index.js`)

**Purpose**: Main authentication API handler

**Key Function**:
```javascript
export async function Auth(env, path, method, body, request)
```

**Routes**:
- `POST /api/auth/exchange`: Exchange one-time token for JWT
- `POST /api/auth/verify-jwt`: Verify JWT token

**Usage**:
```javascript
import { Auth } from './backend/auth/index.js';

const response = await Auth(env, 'exchange', 'POST', body, request);
```

### Session Management (`session.js`)

**Purpose**: JWT token verification and session management

**Key Functions**:
```javascript
export async function verifySessionToken(env, token)
export async function issueSessionToken(env, payload)
```

**Process**:
1. Verify JWT signature
2. Check token expiration
3. Extract user payload
4. Return validation result

---

## � API Endpoints

### POST /api/auth/exchange

**Purpose**: Exchange one-time token for JWT

**Request Body**:
```json
{
  "username": "user",
  "oneTimeToken": "token"
}
```

**Response**:
```json
{
  "valid": true,
  "jwt": "jwt.token.here",
  "oneTimeToken": "new.token.for.renewal"
}
```

### POST /api/auth/verify-jwt

**Purpose**: Verify JWT token

**Request Body**:
```json
{
  "jwt": "jwt.token.here"
}
```

**Response**:
```json
{
  "valid": true,
  "payload": {
    "sub": "username",
    "exp": 1234567890
  }
}
```

---

## �️ Security Features

### Turnstile CAPTCHA

- **Purpose**: Bot protection for login
- **Implementation**: Cloudflare Turnstile widget
- **Verification**: Server-side token validation

### Rate Limiting

- **IP-based tracking**: Prevent brute force attacks
- **User limits**: Maximum users per IP
- **Ban system**: Temporary IP bans for suspicious activity

### Token Security

- **One-time tokens**: Single-use, short-lived
- **JWT tokens**: 30-minute expiration
- **Renewal**: Automatic renewal every 10 minutes
- **Signature verification**: HMAC-SHA256 signatures

---

## 🔑 Token Management

### One-Time Token

- **Purpose**: Initial authentication
- **Lifetime**: 10 minutes
- **Usage**: Single-use, exchanged for JWT
- **Storage**: Cached in login-client-worker

### JWT Token

- **Purpose**: API authentication
- **Lifetime**: 30 minutes
- **Usage**: Sent in Authorization header
- **Renewal**: Every 10 minutes via one-time token
- **Storage**: Cached in login-client-worker

---

## 📖 Development Guidelines

### Adding New Auth Routes

1. Add route handler in `index.js`
2. Implement business logic
3. Add security checks
4. Document in this README

### Security Best Practices

- **Never log sensitive data**: JWTs, passwords, tokens
- **Validate all inputs**: Check for injection attacks
- **Use HTTPS**: All API calls must be secure
- **Rate limit requests**: Prevent abuse

### Error Handling

- Return generic error messages to clients
- Log detailed errors server-side
- Use consistent error codes

---

*Last updated: 2026-10-15*
