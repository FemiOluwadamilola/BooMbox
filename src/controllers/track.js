const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getUserBy } = require("../services/user");
const {
  getTracks,
  addTrack,
  getTrackBy,
  findTrackAndDelete,
  findTrackAndUpdateInfo,
  updateTrackBy,
} = require("../services/track");
const PlayList = require("../models/Play_list");

// GET ALL TRACKS ROUTE
const tracks = async (req, res) => {
  try {
    const tracks = getTracks()
      .select("userId title audio stream_counts likes comments")
      .sort({ createdAt: -1 });
    res.status(200).json({
      object_count: tracks.length,
      results: tracks.map((doc) => {
        return {
          status: 200,
          data: doc,
        };
      }),
    });
  } catch (err) {
    return res.status(500).json(new Error(err));
  }
};

//TRACK UPLOAD ROUTE
const uploadTrack = async (req, res) => {
  try {
    const user = getUserBy(req.user.id);
    if (user) {
      const storage = multer.diskStorage({
        destination: "./tracks_uploads",
        filename: (req, file, cb) => {
          cb(null, "AUD" + "_" + Date.now() + path.extname(file.originalname));
        },
      });
      const track = multer({
        storage,
        fileFilter: (req, file, cb) => {
          const extname = path.extname(file.originalname);
          if (extname !== ".mp3") {
            res.status(403).json({
              message: "accept only .mp3 file only",
            });
          } else {
            cb(null, true);
          }
        },
      }).single("audio");
      track(req, res, async (err) => {
        try {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            const newTrack = addTrack({
              userId: req.user.id,
              title: req.body.title,
              audio: req.file.filename,
              genre: req.body.genre,
              path: req.file.path,
            });

            const savedTrack = newTrack.save();
            res.status(201).json({
              message: "Track uploaded successfully...",
              _id: savedTrack._id,
              title: savedTrack.title,
              audio: savedTrack.audio,
            });
          }
        } catch (err) {
          return res.status(500).json({
            message:
              "Server error: something went wrong, please try again later",
            error: err,
          });
        }
      });
    } else {
      return res.status("403").json({
        message: "Authorization denied",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err,
    });
  }
};

// DELETE TRACK ROUTE
const deleteTrack = async (req, res) => {
  try {
    const user = getUserBy(req.user.id);
    if (user) {
      const track = getTrackBy(req.params.id);
      if (track) {
        fs.stat(path.join(__dirname, "../../tracks_uploads"), (err) => {
          if (err) {
            res
              .status("404")
              .json({ message: "File directory does not exist" });
          } else {
            fs.unlink(
              path.join(__dirname, `../../tracks_uploads/${track.audio}`),
              async (err) => {
                if (err) throw err.message;
                findTrackAndDelete(req.params.id);
                res.status(200).json({
                  message: "track successfully deleted...",
                  request: {
                    type: "POST",
                    description: "UPLOAD_TRACK",
                    url: `${process.env.BOOMBOX_URL}/tracks/`,
                    body: {
                      title: "String",
                      audio: "File",
                    },
                  },
                });
              }
            );
          }
        });
      } else {
        return res.status(403).json({
          message: "Track already deleted from the database...",
        });
      }
    } else {
      return res.status(403).json({
        message: "Oops sorry this user cannot delete this track",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err,
    });
  }
};

// TRACK STREAMING ROUTE
const streamTrack = async (req, res) => {
  try {
    const track = getTrackBy(req.params.id);
    if (track) {
      if (track.stream_counts >= 0) {
        const streamed = (track.stream_counts += 1);
        findTrackAndUpdateInfo(req.params.id, {
          $set: {
            stream_counts: streamed,
          },
        });
      }
      // const range = req.headers.range;
      // if(!range){
      // 	res.status(400).json({
      // 		response:{
      // 			message:'Requires range header!'
      // 		}
      // 	})
      // }

      // const audioSize = fs.statSync(track.audio).size;

      // const CHUNK_SIZE = 10 ** 6;
      // const start = Number(range.replace(/\D/g, ""));
      // const end = Math.min(start + CHUNK_SIZE, audioSize - 1);

      // const contentLength = end - start + 1;
      // const headers = {
      // 	"Content-Range":`bytes ${start}-${end}/${audioSize}`,
      // 	"Accept-Ranges":"bytes",
      // 	"Content-Length":contentLength,
      // 	"Content-Type":"audio/mp3"
      // }

      const audioPath = path.join(
        __dirname,
        `../../tracks_uploads/${track.audio}`
      );
      res.writeHead(200, { "Content-Type": "audio/mp3" });

      const audioStream = fs.createReadStream(audioPath);
      audioStream.pipe(res);
    } else {
      return res.status(404).json({
        message: "Track not found!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err,
    });
  }
};

// TRACK DOWNLOAD ROUTE
const trackDownload = async (req, res) => {
  try {
    const user = getUserBy(req.user.id);
    if (user) {
      const track = getTrackBy(req.params.id);
      if (track) {
        // download track
        res.download(track.path, track.audio);
        // update the download count
        if (track.download_counts >= 0) {
          const downloaded = (track.download_counts += 1);
          findTrackAndUpdateInfo(req.params.id, {
            $set: {
              download_counts: downloaded,
            },
          });
        }
      } else {
        return res.status(404).json({
          message: "Track not found",
        });
      }
    } else {
      return res.status(403).json({
        message: "Please signup to download",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err,
    });
  }
};

// TRACK LIKE
const like = async (req, res) => {
  try {
    const user = getUserBy(req.user.id);
    if (user) {
      const track = getTrackBy(req.params.id);
      if (track) {
        if (!track.likes.includes(user.id)) {
          updateTrackBy({ $push: { likes: user.id } });
          return res.status(200).json({
            message: `${user.username} liked ${track.title}`,
          });
        } else {
          return res.status(403).json({
            message: "Oops sorry track cannot be like twice!",
          });
        }
      } else {
        return res.status(404).json({
          message: "Track not found!",
        });
      }
    } else {
      return res.status(403).json({
        message: "Please signup!!!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err.message,
    });
  }
};

// COMMENT ON TRACK
const comment = async (req, res) => {
  try {
    const userId = getUserBy(req.user.id);
    if (userId) {
      const track = getTrackBy(req.params.id);
      const commentMsg = req.body.comment;
      updateTrackBy({
        $push: {
          comments: {
            user: userId.id,
            commentMsg,
          },
        },
      });

      res.status(200).json({
        message: "Comment made successfully!!!",
      });
    } else {
      return res.status(403).json({
        message: "Please signup!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err.message,
    });
  }
};

// LIVE BAND STREAMING
const liveBandStream = async (req, res) => {
  try {
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err.message,
    });
  }
};

module.exports = {
  tracks,
  uploadTrack,
  deleteTrack,
  streamTrack,
  trackDownload,
  like,
  comment,
  liveBandStream,
};
