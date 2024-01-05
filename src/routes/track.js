const router = require("express").Router();

const {
  tracks,
  uploadTrack,
  deleteTrack,
  streamTrack,
  trackDownload,
  like,
  comment,
  podCastStream,
  searchForTrack,
} = require("../controllers/track");

const verifyToken = require("../middlewares/Auth_verify");

// GET ALL TRACKS ROUTE
router.get("/", tracks);

//TRACK UPLOAD ROUTE
router.post("/", verifyToken, uploadTrack);

// DELETE TRACK ROUTE
router.delete("/:id", verifyToken, deleteTrack);

// TRACK STREAMING ROUTE
router.get("/:id", streamTrack);

// TRACK DOWNLOAD ROUTE
router.get("/download/:id", verifyToken, trackDownload);

// TRACK LIKE
router.get("/like/:id", verifyToken, like);

// TRACK COMMENT
router.post("/:id", verifyToken, comment);

// LIVEBAND STREAM
router.get("/liveStream", verifyToken, podCastStream);

// SEARCH TRACK
router.get("/search", verifyToken, searchForTrack);

module.exports = router;
