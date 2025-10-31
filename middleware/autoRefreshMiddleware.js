const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const { generateToken } = require("../utils/geneateToken");

// Simple function to protect routes
exports.protect = async function (req, res, next) {
  try {
    // Step 1: Get the access token from cookie
    const accessToken = req.cookies["access-token"];
    
    // Step 2: Check if token exists
    if (!accessToken) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    // Step 3: Check if token is valid
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          status: "failed",
          message: "User not found",
        });
      }

      // Step 4: Add user to request and continue
      req.user = user;
      return next();
      
    } catch (err) {
      // Step 5: If access token is expired, try to refresh it
      return await refreshToken(req, res, next);
    }

  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Something went wrong",
    });
  }
};

// Simple function to refresh tokens
async function refreshToken(req, res, next) {
  try {
    // Step 1: Get refresh token from cookie
    const refreshToken = req.cookies["refresh-token"];
    
    if (!refreshToken) {
      return res.status(401).json({
        status: "failed",
        message: "Please login again",
      });
    }

    // Step 2: Check if refresh token is valid
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Step 3: Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user);

    // Step 4: Set new tokens as cookies
    res.cookie("access-token", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh-token", newRefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Step 5: Add user to request and continue
    req.user = user;
    return next();

  } catch (err) {
    return res.status(401).json({
      status: "failed",
      message: "Please login again",
    });
  }
}

/**
 * SIMPLE PROTECT MIDDLEWARE (for comparison)
 * Only checks access token, doesn't handle refresh
 */
exports.protect = async function (req, res, next) {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "Access token required. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded?.id);
    
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "User no longer exists",
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired access token. Please refresh or login.",
    });
  }
};
