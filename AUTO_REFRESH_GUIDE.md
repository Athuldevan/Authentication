# Automatic Token Refresh Authentication System 🔄

## Overview
This implementation provides **automatic token refresh** without requiring a separate refresh endpoint. The middleware handles everything internally, providing a seamless user experience.

## Key Features

### ✅ **Automatic Token Refresh**
- No separate `/auth/refresh` endpoint needed
- Middleware automatically refreshes expired access tokens
- Seamless user experience - no interruption

### ✅ **Secure Token Storage**
- Both access and refresh tokens stored as HTTP-only cookies
- Tokens cannot be accessed by JavaScript (XSS protection)
- Automatic cookie management

### ✅ **Token Rotation**
- Each refresh generates new access AND refresh tokens
- Old refresh tokens are invalidated
- Prevents token reuse attacks

### ✅ **Database Validation**
- Refresh tokens validated against database
- Only tokens stored in DB are considered valid
- Proper logout invalidates all tokens

## How It Works

### 1. **Login Flow**
```
User Login → Generate Access Token (15min) + Refresh Token (30 days)
           → Store both as HTTP-only cookies
           → Store refresh token in database
```

### 2. **Automatic Refresh Flow**
```
Request with expired access token → Middleware detects expiration
                                 → Uses refresh token from cookie
                                 → Validates against database
                                 → Generates new tokens
                                 → Sets new cookies
                                 → Continues request
```

### 3. **Middleware Logic**
```javascript
// Simplified flow
if (accessToken && isValid(accessToken)) {
  // Use existing access token
  continue();
} else if (refreshToken && isValid(refreshToken)) {
  // Refresh access token using refresh token
  generateNewTokens();
  setNewCookies();
  continue();
} else {
  // No valid tokens, require login
  return 401;
}
```

## API Endpoints

### **POST /auth/signup**
Creates new user account
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"john","email":"john@example.com","password":"password123"}'
```

### **POST /auth/login**
Logs in user and sets tokens as cookies
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### **GET /auth/me**
Gets user info with automatic token refresh
```bash
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

### **POST /auth/logout**
Logs out user and clears all cookies
```bash
curl -X POST http://localhost:7000/auth/logout \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

## Client-Side Usage

### **JavaScript/Frontend**
```javascript
// No need to manually handle tokens!
// Just make requests with credentials included

fetch('/auth/me', {
  credentials: 'include' // Include cookies
})
.then(response => response.json())
.then(data => {
  console.log('User:', data.user);
  // Check if new access token was provided
  if (data.newAccessToken) {
    console.log('Token was refreshed automatically!');
  }
});
```

### **React Example**
```javascript
// Simple React component
function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Just fetch data - middleware handles token refresh
    fetch('/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);
  
  return <div>Welcome, {user?.name}!</div>;
}
```

## Security Features

### 🔐 **HTTP-Only Cookies**
- Tokens cannot be accessed by JavaScript
- Prevents XSS attacks
- Automatic cookie management

### 🔄 **Token Rotation**
- New refresh token on each refresh
- Old tokens invalidated immediately
- Prevents token reuse

### 🗄️ **Database Validation**
- Only tokens in database are valid
- Logout removes tokens from database
- Multiple device support

### ⏰ **Short-Lived Access Tokens**
- 15-minute expiration
- Limits damage if compromised
- Automatic refresh when needed

## Testing

### **Run Tests**
```bash
# Start server
npm start

# Run automatic refresh tests
node test-auto-refresh.js
```

### **Manual Testing**
```bash
# 1. Signup
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@example.com","password":"password123"}'

# 2. Login (sets cookies)
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  --cookie-jar cookies.txt

# 3. Access protected route (automatic refresh)
curl -X GET http://localhost:7000/auth/me \
  --cookie cookies.txt

# 4. Logout (clears cookies)
curl -X POST http://localhost:7000/auth/logout \
  --cookie cookies.txt
```

## Benefits

### **For Developers**
- ✅ No need to implement client-side token management
- ✅ No separate refresh endpoint to maintain
- ✅ Automatic error handling
- ✅ Simple API calls

### **For Users**
- ✅ Seamless experience - no interruptions
- ✅ No need to login frequently
- ✅ Works across browser tabs
- ✅ Secure by default

### **For Security**
- ✅ HTTP-only cookies prevent XSS
- ✅ Token rotation prevents reuse attacks
- ✅ Database validation ensures token integrity
- ✅ Short-lived access tokens limit exposure

## Comparison

| Feature | Manual Refresh | Automatic Refresh |
|---------|---------------|-------------------|
| Client Complexity | High | Low |
| API Endpoints | 2 (login + refresh) | 1 (login only) |
| User Experience | Interrupted | Seamless |
| Error Handling | Manual | Automatic |
| Security | Same | Same |

## Conclusion

This automatic token refresh system provides:
- **Better UX**: No interruptions for users
- **Simpler Code**: Less client-side complexity
- **Same Security**: All security features maintained
- **Easier Maintenance**: Fewer endpoints to manage

The middleware handles everything automatically, making authentication transparent to both developers and users! 🚀
