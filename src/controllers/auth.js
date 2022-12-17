const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// USER SIGNUP ROUTE
const userSignup = async (req,res) => {
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

	 	 await newUser.save();
	 	 res.status(200).json({
	 	 	 response:{
	 	 	 	  message:'Signup successfully made...',
	 	 	 	  request:{
	 	 	 	  	 method_type:'POST',
	 	 	 	  	 desc:'SIGNIN_USER',
	 	 	 	  	 url:`${process.env.BOOMBOX_URL}/auth/signin`,
	 	 	 	  	 body:{
	 	 	 	  	 	 email:'user email address',
	 	 	 	  	 	 password:'user password'
	 	 	 	  	 }
	 	 	 	  }
	 	 	 }
	 	 });
	 	}else{
	 	   res.status(403).json({message:'Ooops this email already in use!'})
	 	}
	 }catch(err){
		  return res.status(500).json({
	  		message:'Server error: something went wrong please try again later',
	  		error:err
	  	});
	 }
}

const refreshTokens = [];

// helper functions
const generateAccessToken = (user) => {
	return jwt.sign({id:user._id,email:user.email}, process.env.JWT_SECRET, {expiresIn:'15m'});
}

const generateRefreshToken = (user) => {
	return jwt.sign({id:user._id,email:user.email}, process.env.JWT_SECRET_REFRESH);
}



// USER SIGNIN ROUTE
const userSignin = async(req,res) => {
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
      	 res.status(403).json({message:'Ooops incorrect password...'})
      }
    }else{
      res.status(403).json({message:'Ooops email not recognised...'})
    }
  }catch(err){
	  	return res.status(500).json({
	  		message:'Server error: something went wrong please try again later',
	  		error:err
	  	});
  }
}


// TOKEN REFRESH ROUTE
const tokenRefresh = (req,res) => {
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
}


// FORGET PASSWORD
const forgetPassword = async (req,res) => {
	try{

	}catch(err){
		return res.status(500).json({
		 	response:{
		 		 message:'Server error: something went wrong, please try again later',
		 	 	 error:err
		 	}
		 })
	}
}

module.exports = {
	userSignup,
	userSignin,
	tokenRefresh,
	forgetPassword
}