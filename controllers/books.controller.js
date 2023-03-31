const Book = require("../models/books.model");
const fs = require("fs");

// Read all the books
const getBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Read one book
const getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Read three best rating thanks to averageRating (sort & slice)
const getBestRating = (req, res, next) => {
  Book.find()
    .then((books) => {
      const topThreeBooks = books
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);
      res.status(200).json(topThreeBooks);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Create one book (requires authentication and Multer middleware)
const setBooks = (req, res, next) => {
  try {
    // Check if the request body is empty
    if (!req.body) {
      return res.status(400).json({ message: "Merci de remplir les champs" });
    }
    // Parse the book object from the request body
    const bookObject = JSON.parse(req.body.book);
    // Check value one by one
    const emptyFields = [];
    for (const field in bookObject) {
      if (!bookObject[field]) {
        emptyFields.push(field);
      }
    }
    if (emptyFields.length > 0) {
      const message = `Les champs suivants sont vides : ${emptyFields.join(
        ", "
      )}`;
      return res.status(400).json({ message });
    }
    // Delete the _id property to prevent duplicate IDs
    delete bookObject._id;
    // Create a new Book object with the parsed book object and the image URL
    const book = new Book({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    });
    // Save the new Book object to the database
    book
      .save()
      .then(() => res.status(201).json({ book }))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Update an existing book (auth)
const editBook = (req, res, next) => {
  // Check if the ID is valid
  if (!req.params.id) {
    return res.status(400).json({ error: "L'ID du livre est manquant." });
  }
  // Find the book by its ID
  const book = Book.findOne({ _id: req.params.id }).then((book) => {
    // If an image was uploaded, update the book object with the new image URL
    // Otherwise, update the book object with the request body
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };

    // Check if all required fields are present
    const emptyFields = [];
    for (const field in bookObject) {
      if (!bookObject[field]) {
        emptyFields.push(field);
      }
    }
    if (emptyFields.length > 0) {
      const message = `Les champs suivants sont vides : ${emptyFields.join(
        ", "
      )}`;
      return res.status(400).json({ message });
    }
    // Check if the authenticated user is the owner of the book
    if (book.userId === req.auth.userId) {
      // Update the Book object in the database with the new book object
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => {
          // Respond with a success message
          res.status(200).json({
            message: "Livre modifié avec succès !",
          });
        })
        .catch((error) => {
          // Respond with an error message if something went wrong
          res.status(400).json({
            error: error,
          });
        });
    } else {
      // Respond with an error message if the user is not authorized to update this book
      res.status(403).json({
        error: "Vous n'êtes pas autorisé à modifier ce livre.",
      });
    }
  });
};

// Delete one book (auth)
const deleteBook = (req, res, next) => {
  // Check if the ID is valid
  if (!req.params.id) {
    return res.status(400).json({ error: "L'ID du livre est manquant." });
  }
  // Find the book by its ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Check if the authenticated user is the owner of the book
      if (book.userId === req.auth.userId) {
        const filename = book.imageUrl.split("/images/")[1];
        // Using fs to delete the image from the server
        fs.unlink(`images/${filename}`, () => {
          // Delete the book from the database
          Book.deleteOne({
            _id: req.params.id,
          })
            .then(() => {
              // Respond with a success message
              res.status(200).json({
                message: "Livre supprimé !",
              });
            })
            .catch((error) => {
              // Respond with an error message if something went wrong
              res.status(400).json({
                error: error,
              });
            });
        });
      } else {
        // Respond with an error message if the user is not authorized to delete this book
        res.status(403).json({
          error: "Vous n'êtes pas autorisé à supprimer ce livre.",
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Create new rating (auth)
// Only one rating per user on a same book
const setRating = (req, res, next) => {
  // Find the book by its ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Extract the user ID and rating from the request body
      let userId = req.body.userId;
      let grade = req.body.rating;
      // Check if userId and grade are defined and have a value
      if (!userId || !grade) {
        return res
          .status(400)
          .json({ error: "Merci de remplir tous les champs." });
      }
      const alreadyRated = book.ratings.some(
        (rating) => rating.userId === userId
      );
      if (alreadyRated) {
        return res.status(400).json({ error: "Vous avez déjà voté." });
      }
      const newRating = { userId, grade };
      // Add the new rating to the book's list of ratings
      book.ratings.push(newRating);
      // Update the book's average rating
      const ratingsCount = book.ratings.length;
      let sum = 0;
      for (let i = 0; i < ratingsCount; i++) {
        sum += book.ratings[i].grade;
      }
      book.averageRating = sum / ratingsCount;
      // Convert the book into the expected format
      const cloneBook = Object.assign({}, book.toObject());
      cloneBook.ratings = book.ratings;
      // Update the book object in the database with the new average rating and the new rating list
      return Book.updateOne({ _id: req.params.id }, cloneBook).then(() =>
        res.status(201).json(cloneBook)
      );
    })
    .catch((err) => next(err));
};

module.exports = {
  getBooks,
  getOneBook,
  setBooks,
  editBook,
  deleteBook,
  getBestRating,
  setRating,
};
