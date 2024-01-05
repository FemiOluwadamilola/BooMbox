const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const { createReadStream, createWriteStream } = require("fs");
const DbConnection = require("./src/configs/dbConnection");
const cors = require("./src/middlewares/cors");
const authRoute = require("./src/routes/auth");
const userRoute = require("./src/routes/user");
const trackRoute = require("./src/routes/track");
const playlistRoute = require("./src/routes/playlist");
const app = express();

require("dotenv").config();

// const server = app.listen(PORT, () => console.log('SERVER RUNNING SUCCESSFULLY...'));
// const io = socketIo(server);

// database connection...
DbConnection(mongoose);

// cors
// app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  if (req.method === "OPTIONS") {
    res.headers("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,PUT");
    return res.status(200).json({});
  }

  return next();
});

// express middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());

/*ejs setup middlewares*/
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// routes
// app.use('/', homeRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/tracks", trackRoute);
app.use("/api/playlists", playlistRoute);

// routing error handler
app.use((req, res, next) => {
  const error = new Error("page not found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res) => {
  res.status(error.status || 500);
  res.json({
    message: error.message,
  });
});
// export app into server
module.exports = app;
