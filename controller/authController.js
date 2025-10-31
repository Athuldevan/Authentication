const User = require("../model/userModel");
const { generateToken } = require("../utils/geneateToken");

// Simple signup function
exports.signup = async function (req, res) {
  try {
    // Get user data from request
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide name, email, and password",
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Return success
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Simple login function
exports.login = async function (req, res) {
  try {
    // Get login data from request
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Check password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: "failed",
        message: "Wrong password",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateToken(user);

    
    res.cookie("access-token", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return success
    return res.status(200).json({
      status: "success",
      message: "Login successful",
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
