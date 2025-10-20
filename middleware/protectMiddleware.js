const jwt = require("jsonwebtoken");
exports.protect = async function (req, res) {
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
    if (!token) throw new Error("You are not logged in..Please Login first.");

    // Decoding the token
    const decoded = jwt.verify(token, "access-token");
    console.log(decoded)
    const loggedInUser = await User.findById(decoded?.id);
    if (!loggedInUser) {
      return (
        res.status(401) /
        json({
          status: "success",
          message: "You are not logged in.Please log in..",
        })
      );
    }

    req.user = loggedInUser;
  } catch (err) {
    return res.status(400).json({
      status: "faileddd",
      message: err.message,
    });
  }
};
