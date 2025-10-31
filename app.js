// Load environment variables
require('dotenv').config();

// Import packages
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/authRouter');

// Database connection
const db = `mongodb+srv://athul:RuoKzhNM6tyfDgB2@studentmanagment.kk52gdz.mongodb.net/StudentManagment?retryWrites=true&w=majority&appName=StudentManagment`;

// Connect to database
mongoose.connect(db)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.log("❌ Database error:", err));

// Create app
const app = express();

// Middleware
app.use(express.json());     // Parse JSON requests
app.use(cookieParser());      // Parse cookies

// Routes
app.use("/auth", authRouter);

// Start server
const PORT = 7000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   POST /auth/signup  - Create account`);
  console.log(`   POST /auth/login   - Login`);
  console.log(`   GET  /auth/me      - Get user info (protected)`);
  console.log(`   POST /auth/logout  - Logout`);
  console.log(`\n🔑 How it works:`);
  console.log(`   1. Signup/Login sets tokens as cookies`);
  console.log(`   2. Protected routes check cookies automatically`);
  console.log(`   3. If access token expires, refresh token is used`);
  console.log(`   4. New tokens are set automatically`);
});
