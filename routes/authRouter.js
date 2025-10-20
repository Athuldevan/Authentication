const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authController = require("../controller/authController");
const protect = require("../middleware/protectMiddleware");

router.route("/signup").post(authController.signup);
router.route("/login").post(protect.protect, authController.login);

router.route("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh-token;
    if (!refreshToken) throw new Error("No Refresh Token found");
    const decoded = jwt.verify(refreshToken, "refresh-token");
    const user = await user.findById(decoded.id);
    if (!user) throw new Error("User not found");
    const { accessToken } = await generateToken(user);

    return res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (err) {
    return res.status(400).json({
      status: "sucess",
      message: err.message,
    });
  }
});

module.exports = router;
