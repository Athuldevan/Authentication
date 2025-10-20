const jwt = require("jsonwebtoken");
exports.generateToken = async function (user) {
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
};
