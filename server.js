// Import required modules
const express = require("express"); // Express.js web framework
const connectDB = require("./config/db"); // Database configuration
const dotenv = require("dotenv").config(); // Load environment variables from a .env file
const cors = require("cors"); // Enable Cross-Origin Resource Sharing
const port = 4000; // Server port

// Connect to the database
connectDB();

const app = express(); // Create an Express application

// Enable Cross-Origin Resource Sharing for a specific origin
app.use(
  cors({
    origin: "http://localhost:3000", // Only allow requests from this origin
    credentials: true, // Allow cookies and other credentials to be sent with the request
    optionsSuccessStatus: 200, // Set the status code for successful preflight requests
  })
);

// Middleware that parses incoming request bodies in a middleware before your handlers
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: false })); // Parse incoming URL-encoded data
app.use("/images", express.static("./images")); // Serve static files from the images directory

// Route handlers for books and authentication
app.use("/api/books", require("./routes/books.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

// Start the server
app.listen(port, () => console.log("Server started on port " + port));
