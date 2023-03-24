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

// module.exports.getBestRating = async (req, res) => {
//   const posts = await PostModel.find();
//   res.status(200).json(posts);
// };

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

// module.exports.editBooks = async (req, res) => {
//   const post = await PostModel.findById(req.params.id);

//   if (!post) {
//     res.status(400).json({ message: "Ce post n'existe pas" });
//   }

//   const updatePost = await PostModel.findByIdAndUpdate(post, req.body, {
//     new: true,
//   });

//   res.status(200).json(updatePost);
// };

const deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId === req.token.userId) {
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
          error: "Vous n'êtes pas autorisé à supprimer ce livre",
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// module.exports.setRating = async (req, res) => {
//   if (!req.body.message) {
//     res.status(400).json({ message: "Merci d'ajouter un message" });
//   }

//   const post = await PostModel.create({
//     message: req.body.message,
//     author: req.body.author,
//   });
//   res.status(200).json(post);
// };

module.exports = { getBooks, getOneBook, setBooks, deleteBook };

// exports.likeSauce = (req, res, next) => {
//   Sauce.findOne({ _id: req.params.id })
//       .then((sauce) => {
//           if (req.body.like === 1) {
//               // like sauce
//               sauce.likes++;
//               sauce.usersLiked.push(req.body.userId);
//               sauce
//                   .save()
//                   .then(() =>
//                       res.status(201).json({ message: 'sauce likée' })
//                   )
//                   .catch((error) => res.status(401).json({ error }));
//           }
//           if (req.body.like === -1) {
//               // dislike sauce
//               sauce.dislikes++;
//               sauce.usersDisliked.push(req.body.userId);
//               sauce
//                   .save()
//                   .then(() =>
//                       res.status(201).json({ message: 'Sauce dislikée' })
//                   )
//                   .catch((error) => res.status(400).json({ error }));
//           }
//           if (req.body.like === 0) {
//               // modify vote
//               const findUsersDisliked = sauce.usersDisliked.find(
//                   (user) => (user = req.body.userId)
//               );
//               if (findUsersDisliked) {
//                   sauce.dislikes--;
//                   sauce.usersDisliked.splice(
//                       sauce.usersLiked.indexOf(req.body.userId),
//                       1
//                   );
//                   sauce
//                       .save()
//                       .then(() =>
//                           res.status(201).json({ message: 'sauce délikée' })
//                       )
//                       .catch((error) =>
//                           res
//                               .status(401)
//                               .json({ error, message: 'usersDisliked' })
//                       );
//               }

//               const findUsersLiked = sauce.usersLiked.find(
//                   (user) => (user = req.body.userId)
//               );
//               if (findUsersLiked) {
//                   sauce.likes--;
//                   sauce.usersLiked.splice(
//                       sauce.usersLiked.indexOf(req.body.userId),
//                       1
//                   );
//                   sauce
//                       .save()
//                       .then(() =>
//                           res.status(201).json({ message: 'sauce délikée' })
//                       )
//                       .catch((error) =>
//                           res
//                               .status(401)
//                               .json({ error, message: 'usersLiked' })
//                       );
//               }
//           }
//       })
//       .then(() => console.log(req.body.like))
//       .catch((error) => res.status(400).json({ error }));
// };
