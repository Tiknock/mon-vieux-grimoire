require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");

// Middleware to authenticate requests using JWT token
module.exports = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1];
    // Verify the token with the secret key and get the decoded token object
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Extract the user ID from the decoded token and store it in the request object for later use
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    // Move on to the next middleware
    next();
  } catch (error) {
    // If there's an error, return a 401 Unauthorized status with the error message
    res.status(401).json({ error });
  }
};
