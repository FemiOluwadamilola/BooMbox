const router = require('express').Router();
const {profileUpdate, profileDelete} = require('../controllers/user');
const {userSignup, userSignin, tokenRefresh, forgetPassword} = require('../controllers/auth');
const verifyToken = require('../middlewares/Auth_verify');

// SIGNUP USER 
router.post('/signup', userSignup);

// SIGNIN USER
router.post('/signin', userSignin);

// TOKEN REFRESH
router.post('/refresh', tokenRefresh);

// FORGET PASSWORD
router.post('/forget-password', forgetPassword);

// UPDATE USER PROFILE
router.put('/', verifyToken, profileUpdate)

// DELETE USER ACCOUNT
router.delete('/', verifyToken, profileDelete);

module.exports = router;