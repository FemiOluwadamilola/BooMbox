const User = require("../models/User");

const createUser = (query) => {
  try {
    const user = new User(query);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUser = async (query) => {
  try {
    const user = await User.findOne(query);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUserBy = async (query) => {
  try {
    const user = await User.findById(query);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateUserInfo = async (query) => {
  try {
    const user = await User.findByIdAndUpdate(query);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateUserInfoBy = async (query) => {
  try {
    const user = await user.updateOne(query);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteUser = async (query) => {
  try {
    const user = await User.findByIdAndDelete(query);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  createUser,
  getUser,
  getUserBy,
  updateUserInfo,
  updateUserInfoBy,
  deleteUser,
};
