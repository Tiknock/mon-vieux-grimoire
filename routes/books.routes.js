const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Books = require("../controllers/books.controller");

router.get("/", auth, Books.getBooks);
// router.get("/bestrating", auth, getBestRating);
router.get("/:id", auth, Books.getOneBook);
router.post("/", auth, Books.setBooks);
// router.put("/:id", auth, editBooks);
// router.delete("/:id", auth, deleteBook);
// router.post("/:id/rating", auth, setRating);

module.exports = router;
