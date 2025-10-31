# Database-Only Refresh Token System 🔄

## Overview
This implementation stores **refresh tokens only in the database** (not in cookies), while access tokens are stored as HTTP-only cookies. The middleware handles automatic token refresh when the client provides the refresh token.

## Key Features

### ✅ **Database-Only Refresh Tokens**
- Refresh tokens stored in database only
- Not stored in cookies for better security
- Client manages refresh token storage

### ✅ **HTTP-Only Access Token Cookies**
- Access tokens stored as HTTP-only cookies
- Cannot be accessed by JavaScript (XSS protection)
- Automatic cookie management

### ✅ **Flexible Refresh Token Delivery**
- Client can send refresh token via:
  - Request body: `{ "refreshToken": "..." }`
  - Header: `X-Refresh-Token: ...`
  - Query parameter: `?refreshToken=...`

### ✅ **Automatic Token Refresh**
- Middleware detects expired access tokens
- Uses refresh token to generate new tokens
- Continues request seamlessly

## How It Works

### 1. **Login Flow**
```
User Login → Generate Access Token (15min) + Refresh Token (30 days)
           → Store access token as HTTP-only cookie
           → Store refresh token in database
           → Return refresh token in response body
           → Client stores refresh token (localStorage/sessionStorage)
```

### 2. **Automatic Refresh Flow**
```
Request with expired access token → Middleware detects expiration
                                 → Looks for refresh token in request
                                 → Validates refresh token against database
                                 → Generates new tokens
                                 → Updates access token cookie
                                 → Returns new refresh token in response
                                 → Continues request
```

### 3. **Token Storage**
- **Access Token**: HTTP-only cookie (secure, automatic)
- **Refresh Token**: Database + Client storage (flexible, secure)

## API Endpoints

### **POST /auth/signup**
Creates new user account
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"john","email":"john@example.com","password":"password123"}'
```

### **POST /auth/login**
Logs in user and returns refresh token
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Response:**
```json
{
  "status": "success",
  "message": "logged in successfully",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **GET /auth/me**
Gets user info with automatic token refresh
```bash
# Method 1: Using cookies only (if access token is valid)
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

# Method 2: With refresh token in request body
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# Method 3: With refresh token in header
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt \
  -H "X-Refresh-Token: YOUR_REFRESH_TOKEN"

# Method 4: With refresh token in query parameter
curl -X GET "http://localhost:7000/auth/me?refreshToken=YOUR_REFRESH_TOKEN" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

### **POST /auth/logout**
Logs out user and clears access token cookie
```bash
curl -X POST http://localhost:7000/auth/logout \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

## Client-Side Usage

### **JavaScript/Frontend**
```javascript
// Store refresh token after login
let refreshToken = null;

// Login function
async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  refreshToken = data.refreshToken; // Store refresh token
  
  return data;
}

// Make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
  try {
    // Try with cookies first
    let response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
    
    // If access token expired, try with refresh token
    if (response.status === 401 && refreshToken) {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'X-Refresh-Token': refreshToken
        }
      });
      
      // Update refresh token if new one provided
      const newRefreshToken = response.headers.get('X-New-Refresh-Token');
      if (newRefreshToken) {
        refreshToken = newRefreshToken;
      }
    }
    
    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage
makeAuthenticatedRequest('/auth/me')
  .then(response => response.json())
  .then(data => console.log('User:', data.user));
```

### **React Example**
```javascript
import { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken')
  );
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch('/auth/me', {
        credentials: 'include',
        headers: refreshToken ? {
          'X-Refresh-Token': refreshToken
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Update refresh token if new one provided
        const newRefreshToken = response.headers.get('X-New-Refresh-Token');
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };
  
  return <div>Welcome, {user?.name}!</div>;
}
```

## Security Features

### 🔐 **HTTP-Only Access Token Cookies**
- Access tokens cannot be accessed by JavaScript
- Prevents XSS attacks
- Automatic cookie management

### 🗄️ **Database-Only Refresh Tokens**
- Refresh tokens stored securely in database
- Not exposed in cookies
- Client controls storage method

### 🔄 **Token Rotation**
- New refresh token on each refresh
- Old tokens invalidated immediately
- Prevents token reuse attacks

### ⏰ **Short-Lived Access Tokens**
- 15-minute expiration
- Limits damage if compromised
- Automatic refresh when needed

## Testing

### **Run Tests**
```bash
# Start server
npm start

# Run database-only refresh token tests
node test-db-only-refresh.js
```

### **Manual Testing**
```bash
# 1. Signup
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@example.com","password":"password123"}'

# 2. Login (get refresh token)
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  --cookie-jar cookies.txt

# 3. Access protected route with refresh token
curl -X GET http://localhost:7000/auth/me \
  --cookie cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN_HERE"}'

# 4. Logout (clears access token cookie)
curl -X POST http://localhost:7000/auth/logout \
  --cookie cookies.txt
```

## Benefits

### **For Security**
- ✅ Refresh tokens not exposed in cookies
- ✅ Client controls refresh token storage
- ✅ HTTP-only access token cookies prevent XSS
- ✅ Database validation ensures token integrity

### **For Flexibility**
- ✅ Multiple ways to send refresh token
- ✅ Client can choose storage method
- ✅ Works with any client framework
- ✅ Easy to implement

### **For Developers**
- ✅ Clear separation of concerns
- ✅ Flexible token delivery methods
- ✅ Automatic refresh handling
- ✅ Simple client implementation

## Comparison

| Feature | Cookie-Based | Database-Only |
|---------|-------------|---------------|
| Refresh Token Storage | HTTP-only cookie | Database + Client |
| Client Control | Limited | Full control |
| XSS Protection | High | High |
| Flexibility | Low | High |
| Implementation | Simple | Moderate |

## Conclusion

This database-only refresh token system provides:
- **Better Security**: Refresh tokens not exposed in cookies
- **More Flexibility**: Multiple ways to send refresh tokens
- **Client Control**: Client manages refresh token storage
- **Same UX**: Seamless automatic refresh

The system gives you the best of both worlds - secure HTTP-only cookies for access tokens and flexible database storage for refresh tokens! 🚀
