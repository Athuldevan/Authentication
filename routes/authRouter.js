const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { protect } = require("../middleware/autoRefreshMiddleware");

// Public routes (no login required)
router.post("/signup", authController.signup);  // Create account
router.post("/login", authController.login);    // Login

// Protected routes (login required)
router.get("/me", protect, (req, res) => {
  // This route is protected - only logged in users can access it
  res.json({
    status: "success",
    message: "You are logged in!",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Logout route
router.post("/logout", (req, res) => {
  // Clear the cookies to logout
  res.clearCookie("access-token");
  res.clearCookie("refresh-token");
  
  res.json({
    status: "success",
    message: "Logged out successfully"
  });
});

module.exports = router;
