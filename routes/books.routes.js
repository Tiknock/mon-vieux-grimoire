const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const Books = require("../controllers/books.controller");

router.get("/", Books.getBooks);
// router.get("/bestrating", getBestRating);
router.get("/:id", Books.getOneBook);
// router.post("/", Books.setBooks);
router.post("/", auth, multer, Books.setBooks);
// router.put("/:id", auth, editBooks);
router.delete("/:id", auth, Books.deleteBook);
// router.post("/:id/rating", auth, setRating);

module.exports = router;
