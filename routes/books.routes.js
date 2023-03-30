// Import necessary modules
const express = require("express");
const router = express.Router();

// Import middleware
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// Import controller
const Books = require("../controllers/books.controller");

// Routes
// Get all books
router.get("/", Books.getBooks);
// Get best rated books
router.get("/bestrating", Books.getBestRating);
// Get a specific book by ID
router.get("/:id", Books.getOneBook);
// Add a new book
router.post("/", auth, multer, Books.setBooks);
// Edit an existing book
router.put("/:id", auth, multer, Books.editBook);
// Delete a book by ID
router.delete("/:id", auth, Books.deleteBook);
// Add a rating for a book by ID
router.post("/:id/rating", auth, Books.setRating);

// Export router
module.exports = router;
