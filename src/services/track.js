const Track = require("../models/Track");

const getTracks = async () => {
  try {
    const tracks = await Track.find();
    return tracks;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getTrackBy = async (query) => {
  try {
    const track = await Track.findById(query);
    return track;
  } catch (err) {
    throw new Error(err.message);
  }
};

const addTrack = async (query) => {
  try {
    const track = await Track.create(query);
    return track;
  } catch (err) {
    throw new Error(err.message);
  }
};

const findTrackAndDelete = async (query) => {
  try {
    const track = await Track.findByIdAndDelete(query);
    return track;
  } catch (err) {
    throw new Error(err.message);
  }
};

const findTrackAndUpdateInfo = async (query) => {
  try {
    const track = await Track.findByIdAndUpdate(query);
    return track;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateTrackBy = async (query) => {
  try {
    const track = await Track.updateOne(query);
    return track;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getTracks,
  getTrackBy,
  addTrack,
  findTrackAndDelete,
  findTrackAndUpdateInfo,
  updateTrackBy,
};
