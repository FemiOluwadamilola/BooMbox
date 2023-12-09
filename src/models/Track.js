const mongoose = require("mongoose");
const trackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    audio: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    cover_img: {
      type: String,
    },
    path: {
      type: String,
      required: true,
    },
    stream_counts: {
      type: Number,
      default: 0,
    },
    download_counts: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Array,
    },
    comments: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Track = mongoose.model("Track", trackSchema);

module.exports = Track;
