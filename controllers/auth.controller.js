const User = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Liste de critères de sécurité pour un mot de passe solide
const MIN_LENGTH = 8; // Longueur minimale du mot de passe
const REGEX_UPPERCASE = /[A-Z]/; // Présence de lettres majuscules
const REGEX_LOWERCASE = /[a-z]/; // Présence de lettres minuscules
const REGEX_DIGIT = /[0-9]/; // Présence de chiffres
const REGEX_SPECIAL = /[\W_]/; // Présence de caractères spéciaux
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+.[^\s@]+$/; // Format de l'email

function checkPasswordStrength(password) {
  let errors = [];

  if (password === undefined) {
    errors.push("Le mot de passe n'est pas défini.");
  }
  if (password.length < MIN_LENGTH) {
    errors.push(
      "Le mot de passe doit avoir au moins " + MIN_LENGTH + " caractères."
    );
  }
  if (!REGEX_UPPERCASE.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
  }
  if (!REGEX_LOWERCASE.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule.");
  }
  if (!REGEX_DIGIT.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre.");
  }
  if (!REGEX_SPECIAL.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
  }
  return errors;
}

const register = (req, res, next) => {
  let password = req.body.password;
  const errors = checkPasswordStrength(password);

  const email = req.body.email;
  if (!REGEX_EMAIL.test(email)) {
    errors.push("L'e-mail n'est pas valide.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ user }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

const login = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

module.exports = { register, login };
