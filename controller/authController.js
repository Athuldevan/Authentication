const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/geneateToken");

// Signup
exports.signup = async function (req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      throw new Error("Please provide all your essential credentials ");
    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: "success",
      user,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Login
exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new Error(`Please provide email and password`);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "No such user exists",
      });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new Error(`Invalid email or password`);
    const { refreshToken, accessToken } = await generateToken(user);

    // Store refresh token as Http cookie
    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return res.status(200).json({
      status: "success",
      message: "logged in succesfully",
      accessToken,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
