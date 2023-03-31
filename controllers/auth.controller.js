const User = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// List of security criteria for a strong password
const MIN_LENGTH = 8; // Minimum length of password
const REGEX_UPPERCASE = /[A-Z]/; // Presence of uppercase letters
const REGEX_LOWERCASE = /[a-z]/; // Presence of lowercase letters
const REGEX_DIGIT = /[0-9]/; // Presence of digits
const REGEX_SPECIAL = /[\W_]/; // Presence of special characters
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email format

// Checks the strength of the password provided
function checkPasswordStrength(password) {
  let errors = [];

  // Check if password is undefined
  if (password === undefined) {
    errors.push("Password is not defined.");
  }

  // Check if password length is less than minimum required length
  if (password.length < MIN_LENGTH) {
    errors.push("Password must have at least " + MIN_LENGTH + " characters.");
  }

  // Check if password contains at least one uppercase letter
  if (!REGEX_UPPERCASE.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  // Check if password contains at least one lowercase letter
  if (!REGEX_LOWERCASE.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  // Check if password contains at least one digit
  if (!REGEX_DIGIT.test(password)) {
    errors.push("Password must contain at least one digit.");
  }

  // Check if password contains at least one special character
  if (!REGEX_SPECIAL.test(password)) {
    errors.push("Password must contain at least one special character.");
  }

  return errors;
}

// Registers a new user
const register = (req, res, next) => {
  let password = req.body.password;
  const errors = checkPasswordStrength(password);

  const email = req.body.email;

  // Check if email is valid
  if (!REGEX_EMAIL.test(email)) {
    errors.push("Email is not valid.");
  }

  // If there are errors in password or email, return error response
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  // Hash password and save user to database
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ user }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Logs in a user
const login = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  // Find user with matching email in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        // If user is not found, return error response
        return res.status(401).json({ error: "User not found!" });
      }
      bcrypt
        .compare(password, user.password)
        .then((valid) => {
          if (!valid) {
            // If password is incorrect, return error response
            return res.status(401).json({ error: "Incorrect password!" });
          }
          // If login is successful, return user ID and JWT token
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

module.exports = { register, login };
