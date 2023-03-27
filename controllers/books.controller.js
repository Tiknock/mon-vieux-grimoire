const Book = require("../models/books.model");
const fs = require("fs");

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

const getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

const getBestRating = (req, res, next) => {
  Book.find()
    .then((books) => {
      res
        .status(200)
        .json(books.sort((a, b) => b.averageRating - a.averageRating).slice(4));
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

const setBooks = (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Merci de remplir les champs" });
    }
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    const book = new Book({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    });
    book
      .save()
      .then(() => res.status(201).json({ book }))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

const editBook = (req, res, next) => {
  const book = Book.findOne({ _id: req.params.id }).then((book) => {
    const bookObject = req.file
      ? {
          // ? = Simplification de If avec ':' pour l'équivalent du else
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`, // Génération de l'url de la nouvelle image
        }
      : { ...req.body }; // Si la photo n'est pas modifié
    if (book.userId === req.auth.userId) {
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => {
          res.status(200).json({
            message: "Livre modifié avec succès !",
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
    } else {
      res.status(401).json({
        error: "Vous n'êtes pas autorisé à modifier ce livre.",
      });
    }
  });
};

const deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId === req.auth.userId) {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({
            _id: req.params.id,
          })
            .then(() => {
              res.status(200).json({
                message: "Livre supprimé !",
              });
            })
            .catch((error) => {
              res.status(400).json({
                error: error,
              });
            });
        });
      } else {
        res.status(401).json({
          error: "Vous n'êtes pas autorisé à supprimer ce livre.",
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

const setRating = (req, res, next) => {
  console.log(req.params.id);
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      return book.save();
    })
    .then((book) => {
      const cloneBook = Object.assign({}, book.toObject());
      cloneBook.rating = book.rating;
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
