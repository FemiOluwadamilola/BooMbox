const bcrypt = require("bcrypt");
const User = require("../models/User");

// UPDATE USER account
const accountUpdate = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    if (req.body.password) {
      try {
        res.body.password = bcrypt.hash(req.body.password, bcrypt.genSalt(10));
      } catch (err) {
        return res.status(500).json({
          message: "Server error: something went wrong, please try again later",
          error: err,
        });
      }
    } else {
      try {
        const updatedUserInfo = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
      } catch (err) {
        return res.status(500).json({
          message: "Server error: something went wrong, please try again later",
          error: err,
        });
      }
    }
  } else {
    return res.status(404).json({
      message: "User not Found!",
      error: 404,
    });
  }
};

// DELETE USER ACCOUNT
const accountDelete = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Account successfully deleted...",
      });
    } catch (err) {
      return res.status(500).json({
        message: "Server error: something went wrong, please try again later",
        error: err,
      });
    }
  } else {
    return res.status(404).json({
      message: "User not Found!",
      error: 404,
    });
  }
};

// SUBSCRIPE A USER
const subscripe = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);
      if (!user.followers.includes(req.user.id)) {
        await user.updateOne({ $push: { subscripers: req.user.id } });
        await currentUser.updateOne({ $push: { subscriping: req.params.id } });
        return res.status(200).json({
          message: `You now subscripe to ${user.username}`,
        });
      } else {
        return res.status(403).json({
          message: "you are already following this user",
        });
      }
    } else {
      return res.status(403).json({
        message: "Invalid you can't follow your own Account",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err,
    });
  }
};

// UNSUBSCRIPE A USER
const unsubscripe = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);
      if (user.followers.includes(req.user.id)) {
        await user.updateOne({ $pull: { subscripers: req.user.id } });
        await currentUser.updateOne({ $pull: { subscriping: req.params.id } });
        return res.status(200).json({
          message: `You now unsubscripe from ${user.username}`,
        });
      } else {
        return res.status(403).json({
          message: "you are no longer following this user",
        });
      }
    } else {
      return res.status(403).json({
        message: "Invalid you can't unfollow your own Account",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error: something went wrong, please try again later",
      error: err,
    });
  }
};

module.exports = {
  accountUpdate,
  accountDelete,
  subscripe,
  unsubscripe,
};
