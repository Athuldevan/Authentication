# Simple JWT Authentication Guide for Beginners 🚀

## What is JWT Authentication?

JWT (JSON Web Token) is like a **digital ID card** for your app:
- **Access Token**: Short-lived (15 minutes) - like a visitor pass
- **Refresh Token**: Long-lived (30 days) - like a master key
- **Cookies**: Store tokens securely in the browser

## How It Works (Simple Version)

```
1. User signs up → Account created
2. User logs in → Gets tokens (stored as cookies)
3. User visits protected page → Tokens checked automatically
4. If access token expires → Refresh token makes new tokens
5. User logs out → Cookies cleared
```

## File Structure

```
Authentication/
├── app.js                    # Main server file
├── controller/
│   └── authController.js     # Signup/Login logic
├── middleware/
│   └── autoRefreshMiddleware.js  # Protect routes
├── model/
│   └── userModel.js          # User database schema
├── routes/
│   └── authRouter.js         # API endpoints
├── utils/
│   └── geneateToken.js       # Create JWT tokens
└── .env                      # Secret keys
```

## Step-by-Step Explanation

### 1. **Signup** (`POST /auth/signup`)
```javascript
// What happens:
// 1. Get name, email, password from request
// 2. Check if all fields provided
// 3. Create user in database
// 4. Password gets hashed automatically
// 5. Return success message
```

### 2. **Login** (`POST /auth/login`)
```javascript
// What happens:
// 1. Get email, password from request
// 2. Find user in database
// 3. Check if password is correct
// 4. Generate access token (15 min) + refresh token (30 days)
// 5. Set both tokens as cookies
// 6. Return success message
```

### 3. **Protected Route** (`GET /auth/me`)
```javascript
// What happens:
// 1. Check if access token cookie exists
// 2. If valid → continue
// 3. If expired → use refresh token to make new tokens
// 4. Set new tokens as cookies
// 5. Return user info
```

### 4. **Logout** (`POST /auth/logout`)
```javascript
// What happens:
// 1. Clear access token cookie
// 2. Clear refresh token cookie
// 3. Return success message
```

## Testing Your App

### **Start Server**
```bash
npm start
```

### **Test with Simple Script**
```bash
node simple-test.js
```

### **Test with curl (Command Line)**

1. **Create Account**
```bash
curl -X POST http://localhost:7000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

2. **Login**
```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  --cookie-jar cookies.txt
```

3. **Access Protected Route**
```bash
curl -X GET http://localhost:7000/auth/me \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

4. **Logout**
```bash
curl -X POST http://localhost:7000/auth/logout \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

## Frontend Usage (JavaScript)

### **Simple Fetch Example**
```javascript
// Login
fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: include cookies
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Access protected route
fetch('/auth/me', {
  credentials: 'include' // Include cookies
})
.then(res => res.json())
.then(data => console.log(data));
```

### **React Example**
```javascript
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    fetch('/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setUser(data.user);
        }
      });
  }, []);

  const login = async () => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      // Refresh user data
      window.location.reload();
    }
  };

  const logout = async () => {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.name}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

## Key Concepts for Beginners

### **Cookies vs LocalStorage**
- **Cookies**: More secure, sent automatically with requests
- **LocalStorage**: Less secure, can be accessed by JavaScript

### **HTTP-Only Cookies**
- Cannot be accessed by JavaScript
- Prevents XSS attacks
- More secure than regular cookies

### **Token Expiration**
- **Access Token**: 15 minutes (short for security)
- **Refresh Token**: 30 days (long for convenience)
- **Automatic Refresh**: When access token expires, refresh token makes new ones

### **Middleware**
- Code that runs before your route handlers
- Checks if user is logged in
- Handles token refresh automatically

## Common Questions

### **Q: Why use cookies instead of localStorage?**
A: Cookies are more secure and sent automatically with requests.

### **Q: What happens when tokens expire?**
A: The middleware automatically refreshes them using the refresh token.

### **Q: How do I protect a route?**
A: Add the `protect` middleware: `router.get('/protected', protect, handler)`

### **Q: How do I logout?**
A: Call the logout endpoint - it clears the cookies.

## Security Features

✅ **Password Hashing**: Passwords are never stored in plain text
✅ **HTTP-Only Cookies**: Tokens cannot be accessed by JavaScript
✅ **Token Expiration**: Short-lived access tokens limit damage
✅ **Automatic Refresh**: Seamless user experience
✅ **Environment Variables**: Secret keys stored securely

## Next Steps

1. **Test the app**: Run `node simple-test.js`
2. **Try the endpoints**: Use curl or Postman
3. **Build a frontend**: Use the React example above
4. **Add more routes**: Protect them with the `protect` middleware
5. **Deploy**: Use Heroku, Vercel, or similar

## Troubleshooting

### **"Please login first"**
- User needs to login first
- Check if cookies are being sent

### **"User not found"**
- User doesn't exist in database
- Check email spelling

### **"Wrong password"**
- Password is incorrect
- Check password spelling

### **Database connection error**
- Check MongoDB connection string
- Make sure MongoDB is running

Happy coding! 🎉
