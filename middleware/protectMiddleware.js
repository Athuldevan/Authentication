const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

exports.protect = async function (req, res, next) {
  try {
    let token;
    // Getting the token from Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // If theer is no token
    if (!token) throw new Error("You are not logged in. Please login first.");

    // Decoding the token
    const decoded = jwt.verify(token, "access-token");
    const loggedInUser = await User.findById(decoded?.id);
    if (!loggedInUser) throw new Error("User no longer exists");

    req.user = loggedInUser;
    return next();
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
