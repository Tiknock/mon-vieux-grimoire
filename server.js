const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const port = 4000;

// connexion à la DB
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware qui permet de traiter les données de la Request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static("./images"));

app.use("/api/books", require("./routes/books.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

// Lancer le serveur
app.listen(port, () => console.log("Le serveur a démarré au port  " + port));
