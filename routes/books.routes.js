const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const Books = require("../controllers/books.controller");

router.get("/", Books.getBooks);
router.get("/bestrating", Books.getBestRating);
router.get("/:id", Books.getOneBook);
router.post("/", auth, multer, Books.setBooks);
router.put("/:id", auth, multer, Books.editBook);
router.delete("/:id", auth, Books.deleteBook);
router.post("/:id/rating", auth, Books.setRating);

module.exports = router;
