const Book = require("../models/books.model");

const getBooks = (req, res) => {
  const books = Book.find();
  res.status(200).json(books);
};

const getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};
// module.exports.getBestRating = async (req, res) => {
//   const posts = await PostModel.find();
//   res.status(200).json(posts);
// };

const setBooks = (req, res) => {
  // if (!req.body.message) {
  //   res.status(400).json({ message: "Merci de remplir les champs" });
  // }
  try {
    const books = Book.create(req.body);
    res.status(200).json(books);
  } catch {
    console.log(error.message);
    res.status(500).json({ message: error.message });
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

// module.exports.deleteBook = async (req, res) => {
//   const post = await PostModel.findById(req.params.id);

//   if (!post) {
//     res.status(400).json({ message: "Ce post n'existe pas" });
//   }
//   await post.remove();
//   res.status(200).json("Message supprimé " + req.params.id);
// };

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

module.exports = { getBooks, getOneBook, setBooks };
