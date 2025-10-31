# JWT Authentication Learning Guide 🚀

## What We Built
- **Access Tokens**: Short-lived (15 minutes) for API access
- **Refresh Tokens**: Long-lived (30 days) stored in database
- **Token Rotation**: New refresh token on each refresh
- **Secure Logout**: Tokens invalidated from database

## Testing Commands (Beginner Friendly)

### 1. Start Your Server
```bash
npm start
```
*This starts your server on http://localhost:7000*

### 2. Create a New User (Signup)
```bash
curl -X POST http://localhost:7000/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"john\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**What happens:**
- Creates new user in database
- Password gets hashed automatically
- Returns success message

### 3. Login (Get Tokens)
```bash
curl -X POST http://localhost:7000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**What happens:**
- Validates email/password
- Generates access token (15 min) and refresh token (30 days)
- Stores refresh token in database
- Sets refresh token as HTTP-only cookie
- Returns access token in response

**Expected Response:**
```json
{
  "status": "success",
  "message": "logged in succesfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Access Protected Route (Test Access Token)
```bash
curl -X GET http://localhost:7000/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**What happens:**
- Middleware checks Authorization header
- Verifies access token
- Returns user information

**Expected Response:**
```json
{
  "status": "success",
  "user": {
    "id": "user_id_here",
    "name": "john",
    "email": "john@example.com"
  }
}
```

### 5. Refresh Access Token (When Expired)
```bash
curl -X POST http://localhost:7000/auth/refresh ^
  -H "Cookie: refresh-token=YOUR_REFRESH_TOKEN_HERE"
```

**What happens:**
- Reads refresh token from cookie
- Validates token against database
- Generates new access token
- Rotates refresh token (old removed, new added)
- Returns new access token

### 6. Logout (Invalidate Tokens)
```bash
curl -X POST http://localhost:7000/auth/logout ^
  -H "Cookie: refresh-token=YOUR_REFRESH_TOKEN_HERE"
```

**What happens:**
- Removes refresh token from database
- Clears refresh token cookie
- User must login again to get new tokens

## Learning Concepts

### 🔐 Token Types
- **Access Token**: Like a temporary pass (15 min)
- **Refresh Token**: Like a master key (30 days)

### 🍪 Cookie vs Header
- **Refresh Token**: Stored in HTTP-only cookie (more secure)
- **Access Token**: Sent in Authorization header

### 🔄 Token Rotation
- Each refresh generates NEW refresh token
- Old refresh token is deleted
- Prevents token reuse attacks

### 🗄️ Database Storage
- Refresh tokens stored in user document
- Only tokens in database are valid
- Logout removes token from database

## Common Errors & Solutions

### Error: "No Refresh Token found"
**Cause:** Cookie not set or expired
**Solution:** Login again to get new tokens

### Error: "Invalid refresh token"
**Cause:** Token not in database or expired
**Solution:** Login again

### Error: "You are not logged in"
**Cause:** Missing or invalid access token
**Solution:** Use refresh endpoint or login again

## Beginner Tips

1. **Always check response status** before using tokens
2. **Copy tokens carefully** - they're long strings
3. **Use refresh endpoint** when access token expires
4. **Clear cookies** in browser to test logout
5. **Check database** to see stored refresh tokens

## Next Steps to Learn

1. Try all commands above
2. Check MongoDB to see stored tokens
3. Test token expiration (wait 15 minutes)
4. Try accessing protected route without token
5. Test logout and try using old refresh token

Happy Learning! 🎉
