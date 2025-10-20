const jwt = require("jsonwebtoken");
exports.generateToken = async function (user) {
  try {
    //Access token...
    const accessToken = jwt.sign({ id: user?._id }, "access-token", {
      expiresIn: "15m",
    });


    // Refresh token...
    const refreshToken = jwt.sign({ id: user?._id }, "refresh-token", {
      expiresIn: "30d",
    });
    
    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    return res.status(400).json({
      status: "success",
      message: err.message,
    });
  }
};
