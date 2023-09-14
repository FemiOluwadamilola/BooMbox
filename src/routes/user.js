const router = require("express").Router();
const {
  accountUpdate,
  accountDelete,
  subscripe,
  unsubscripe,
} = require("../controllers/user");
const {
  userSignup,
  userSignin,
  tokenRefresh,
  logout,
  forgetPassword,
} = require("../controllers/auth");
const verifyToken = require("../middlewares/Auth_verify");

// SIGNUP USER
router.post("/signup", userSignup);

// SIGNIN USER
router.post("/signin", userSignin);

// TOKEN REFRESH
router.post("/refresh", tokenRefresh);

// LOGOUT ROUTE
router.post("/logout", verifyToken, logout);

// FORGET PASSWORD
router.post("/forget-password", forgetPassword);

// UPDATE USER PROFILE
router.put("/", verifyToken, accountUpdate);

// DELETE USER ACCOUNT
router.delete("/", verifyToken, accountDelete);

// FOLLOW A USER
router.put("/:id", verifyToken, subscripe);

// UNFOLLOW A USER
router.put("/:id/unsubscripe", verifyToken, unsubscripe);

module.exports = router;
