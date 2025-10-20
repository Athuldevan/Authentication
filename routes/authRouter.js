const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authController = require("../controller/authController");
const { protect } = require("../middleware/protectMiddleware");
const User = require("../model/userModel");
const { generateToken } = require("../utils/generateToken");

router.route("/signup").post(authController.signup);
// Login should NOT be protected
router.route("/login").post(authController.login);

router.route("/refresh").post(async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh-token;
    if (!refreshToken) throw new Error("No Refresh Token found");
    const decoded = jwt.verify(refreshToken, "refresh-token");
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");
    const { accessToken } = await generateToken(user);

    return res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
});

// Protected route example to test access token
router.get("/me", protect, async (req, res) => {
  return res.status(200).json({
    status: "success",
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
});

// Logout: clear refresh cookie
router.post("/logout", (req, res) => {
  res.clearCookie("refresh-token", { httpOnly: true, secure: false });
  return res.status(200).json({ status: "success", message: "Logged out" });
});

module.exports = router;
