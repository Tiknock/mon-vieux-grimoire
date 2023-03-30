const express = require("express");
const router = express.Router();

// Importing the AuthController
const AuthController = require("../controllers/auth.controller");

// Defining the endpoints for user registration and login
router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);

// Exporting the router
module.exports = router;
