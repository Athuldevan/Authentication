# Cookie-Based Refresh Token System 🍪

## Overview
This implementation stores **both access and refresh tokens as HTTP-only cookies**. No database storage is needed - everything is handled through secure cookies with automatic token refresh.

## Key Features

### ✅ **HTTP-Only Cookie Storage**
- Both access and refresh tokens stored as HTTP-only cookies
- Cannot be accessed by JavaScript (XSS protection)
- Automatic cookie management

### ✅ **No Database Storage**
- No refresh token storage in database schema
- Simpler implementation
- No database queries for token validation

### ✅ **Automatic Token Refresh**
- Middleware detects expired access tokens
- Uses refresh token from cookie automatically
- Generates new tokens and updates cookies
- Seamless user experience

### ✅ **Token Rotation**
- Each refresh generates new access AND refresh tokens
- Old cookies are replaced with new ones
- Prevents token reuse attacks

## How It Works

### 1. **Login Flow**
```
User Login → Generate Access Token (15min) + Refresh Token (30 days)
           → Store both as HTTP-only cookies
           → Return success response
```

### 2. **Automatic Refresh Flow**
```
Request with expired access token → Middleware detects expiration
                                 → Uses refresh token from cookie
                                 → Generates new tokens
                                 → Updates both cookies
                                 → Continues request
```

### 3. **Middleware Logic**
```javascript
// Simplified flow
if (accessToken && isValid(accessToken)) {
  // Use existing access token
  continue();
} else if (refreshToken && isValid(refreshToken)) {
  // Refresh both tokens using refresh token
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
Logs in user and sets both tokens as cookies
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  --cookie-jar cookies.txt
```

**Response:**
```json
{
  "status": "success",
  "message": "logged in successfully"
}
```

### **GET /auth/me**
Gets user info with automatic token refresh
```bash
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

### **POST /auth/logout**
Logs out user and clears both token cookies
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
  // Tokens are automatically managed via cookies
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

### **Axios Example**
```javascript
// Configure axios to include cookies
axios.defaults.withCredentials = true;

// Make requests - tokens handled automatically
axios.get('/auth/me')
  .then(response => {
    console.log('User:', response.data.user);
  })
  .catch(error => {
    console.error('Request failed:', error);
  });
```

## Security Features

### 🔐 **HTTP-Only Cookies**
- Tokens cannot be accessed by JavaScript
- Prevents XSS attacks
- Automatic cookie management

### 🔄 **Token Rotation**
- New tokens on each refresh
- Old cookies replaced immediately
- Prevents token reuse

### ⏰ **Short-Lived Access Tokens**
- 15-minute expiration
- Limits damage if compromised
- Automatic refresh when needed

### 🍪 **Secure Cookie Settings**
- HTTP-only: Cannot be accessed by JavaScript
- Secure: Only sent over HTTPS (in production)
- SameSite: Prevents CSRF attacks

## Testing

### **Run Tests**
```bash
# Start server
npm start

# Run cookie-based refresh token tests
node test-cookie-refresh.js
```

### **Manual Testing**
```bash
# 1. Signup
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@example.com","password":"password123"}'

# 2. Login (sets both tokens as cookies)
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  --cookie-jar cookies.txt

# 3. Access protected route (automatic refresh)
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

# 4. Logout (clears both token cookies)
curl -X POST http://localhost:7000/auth/logout \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

## Benefits

### **For Developers**
- ✅ No need to implement client-side token management
- ✅ No database storage needed
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
- ✅ Short-lived access tokens limit exposure
- ✅ No database token storage reduces attack surface

## Comparison

| Feature | Database Storage | Cookie Storage |
|---------|------------------|----------------|
| Implementation | Complex | Simple |
| Database Queries | Required | None |
| Client Complexity | High | Low |
| Security | Good | Excellent |
| Performance | Slower | Faster |

## Cookie Configuration

### **Access Token Cookie**
```javascript
res.cookie("access-token", accessToken, {
  httpOnly: true,    // Cannot be accessed by JavaScript
  secure: false,     // Set to true in production with HTTPS
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

### **Refresh Token Cookie**
```javascript
res.cookie("refresh-token", refreshToken, {
  httpOnly: true,    // Cannot be accessed by JavaScript
  secure: false,     // Set to true in production with HTTPS
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});
```

## Production Considerations

### **Security Settings**
```javascript
// In production, use these settings:
res.cookie("access-token", accessToken, {
  httpOnly: true,
  secure: true,      // Only over HTTPS
  sameSite: 'strict', // Prevent CSRF
  maxAge: 15 * 60 * 1000,
});
```

### **Environment Variables**
```env
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

## Conclusion

This cookie-based refresh token system provides:
- **Maximum Simplicity**: No database storage needed
- **Best Security**: HTTP-only cookies prevent XSS
- **Seamless UX**: Automatic token refresh
- **Easy Implementation**: Just include cookies in requests

The system gives you the simplest possible implementation while maintaining excellent security! 🚀
