const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middlewares/Auth_verify');

// User Signup route;
router.post('/signup', async (req,res) => {
	 try{
	  const {username,email} = req.body;
	 	const user = await User.findOne({email});
	 	if(!user){
	 		const hashedPassword = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10))
	 	 const newUser = new User({
	 	 	username,
	 	 	email,
	 	 	password:hashedPassword
	 	 });

	 	 const savedUser = await newUser.save();
	 	 res.status(200).json(savedUser);
	 	}else{
	 	   res.status(403).json({err_message:'Ooops email already in use by another user...'})
	 	}
	 }catch(err){
	 	res.status(500).json({err_message:err.message})
	 }
})

const refreshTokens = [];

// helper functions
const generateAccessToken = (user) => {
	return jwt.sign({id:user._id,email:user.email}, process.env.JWT_SECRET, {expiresIn:'15m'});
}

const generateRefreshToken = (user) => {
	return jwt.sign({id:user._id,email:user.email}, process.env.JWT_SECRET_REFRESH);
}



// User Signin route
router.post('/signin', async(req,res) => {
  const {email,password} = req.body;
  try{
    const user = await User.findOne({email});
    if(user){
    	const validUserPassword = await bcrypt.compare(password, user.password)
      if(validUserPassword){
      	const {password, ...others} = user._doc; 
      	const accessToken = generateAccessToken(others)
      	const refreshToken = generateRefreshToken(others);
      	 refreshTokens.push(refreshToken);
      	 res.status(200).json({
      	 	 response:{
      	 	 	  message:'success login',
      	 	 	  accessToken,
      	 	 	  refreshToken
      	 	 }
      	 })
      }else{
      	 res.status(403).json({err_message:'Ooops incorrect password...'})
      }
    }else{
      res.status(403).json({err_message:'Ooops email not recognised...'})
    }
  }catch(err){
  	res.status(500).json({error:err.message});
  }
});


// TOKEN REFRESH ROUTE
router.post('/refresh', (req,res) => {
  const refreshToken = req.body.token;
	  if(!refreshToken) return res.status(401).json({
	  	 message:'You are not authenticated'
	  })

	  if(!refreshTokens.includes(refreshToken)){
	  	 return res.status(403).json({
	  	 	 message:'Refresh token is not valid!'
	  	 })
	  }

	  jwt.verify(refreshToken,process.env.JWT_SECRET_REFRESH, (err,user) => {
	  	 if(err) throw err.message
	  	  refreshTokens = refreshTokens.filter(token => token !== refreshToken);

	  	  const newAccessToken = generateAccessToken(user);
	  	  const newRefreshToken = generateRefreshToken(user);

	  	  refreshTokens.push(newRefreshToken);
	  	  
	  	  res.status(200).json({
	  	  	accessToken:newAccessToken,
	  	  	refreshToken:newRefreshToken
	  	  })
	  })
})

module.exports = router;