const jwt = require("jsonwebtoken");

/**
 * Generate JWT tokens for user authentication
 * @param {Object} user - User object from database
 * @returns {Object} - Object containing accessToken and refreshToken
 */
exports.generateToken = async function (user) {
  // ACCESS TOKEN: Short-lived token (15 minutes) for API access
  // Contains user ID and expires quickly for security
  const accessToken = jwt.sign(
    { id: user?._id },                    // Payload: user ID
    process.env.JWT_ACCESS_SECRET,         // Secret key from environment
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN } // Expiration time
  );

  // REFRESH TOKEN: Long-lived token (30 days) for getting new access tokens
  // Also contains user ID but expires much later
  const refreshToken = jwt.sign(
    { id: user?._id },                    // Payload: user ID
    process.env.JWT_REFRESH_SECRET,       // Different secret key for security
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // Longer expiration
  );

  // Return both tokens
  return {
    accessToken,    // Use this for API requests (short-lived)
    refreshToken,  // Use this to get new access tokens (long-lived)
  };
};
