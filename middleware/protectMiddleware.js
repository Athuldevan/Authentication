const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const { generateToken } = require("../utils/generateToken");

// Main protect middleware
exports.protect = async function (req, res, next) {
  try {
    // Get access token from cookies
    const accessToken = req.cookies["access-token"];

    if (!accessToken) {
      return res.status(401).json({ status: "failed", message: "Please login first" });
    }

    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ status: "failed", message: "User not found" });
      }

      req.user = user;
      return next();

    } catch (err) {
      // Only refresh if token expired
      if (err.name === "TokenExpiredError") {
        return await refreshToken(req, res, next);
      }
      return res.status(401).json({ status: "failed", message: "Invalid access token" });
    }

  } catch (err) {
    return res.status(500).json({ status: "failed", message: "Something went wrong" });
  }
};

// Refresh token logic
async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
      return res.status(401).json({ status: "failed", message: "Please login again" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ status: "failed", message: "User not found" });
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user);

    // Set cookies securely
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("access-token", newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
    res.cookie("refresh-token", newRefreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

    req.user = user;
    return next();

  } catch (err) {
    return res.status(401).json({ status: "failed", message: "Please login again" });
  }
}
