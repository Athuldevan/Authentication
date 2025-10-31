# Quick Test Commands for JWT Authentication 🚀

## Start Your Server
```bash
npm start
```

## Test Commands (Copy & Paste)

### 1. Create a User
```bash
curl -X POST http://localhost:7000/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"john\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### 2. Login (Get Tokens)
```bash
curl -X POST http://localhost:7000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### 3. Access Protected Route (Replace YOUR_TOKEN with actual token)
```bash
curl -X GET http://localhost:7000/auth/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Refresh Token (Replace YOUR_REFRESH_TOKEN with actual token)
```bash
curl -X POST http://localhost:7000/auth/refresh -H "Cookie: refresh-token=YOUR_REFRESH_TOKEN_HERE"
```

### 5. Logout
```bash
curl -X POST http://localhost:7000/auth/logout -H "Cookie: refresh-token=YOUR_REFRESH_TOKEN_HERE"
```

## What Each Command Does:

1. **Signup**: Creates new user, password gets hashed automatically
2. **Login**: Returns access token, sets refresh token cookie
3. **Me**: Tests access token (protected route)
4. **Refresh**: Gets new access token using refresh token
5. **Logout**: Invalidates refresh token, clears cookie

## Learning Tips:
- Copy the access token from login response
- Use browser dev tools to see cookies
- Check MongoDB to see stored refresh tokens
- Try accessing /me without token (should fail)
- Try using expired token (should fail)

Happy Learning! 🎉
