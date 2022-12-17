const bcrypt = require('bcrypt');
const User = require('../models/User');


// UPDATE USER PROFILE
const profileUpdate = async (req,res) => {
	const user = await User.findById(req.user.id)
  if(user){
  	if(req.body.password){
  		try{
  		  res.body.password = bcrypt.hash(req.body.password, bcrypt.genSalt(10))
  		}catch(err){
  			return res.status(500).json({
			 	  message:'Server error: something went wrong, please try again later',
			 	  error:err
			 })
  		}
  	}else{
  		try{
  		  const updatedUserInfo = await User.findByIdAndUpdate(req.params.id,{
  		  	$set: req.body
  		  },{new:true})
  		}catch(err){
  			return res.status(500).json({
			 	 message:'Server error: something went wrong, please try again later',
			 	 error:err
			 })
  		}
  	}
  }else{
  	return res.status(404).json({
			message:'User not Found!',
			error:404
		})
  }
}

// DELETE USER ACCOUNT
const profileDelete = async (req,res) => {
	const user = await User.findById(req.user.id);
	if(user){
		try{
		  await User.findByIdAndDelete(req.params.id);
		  res.status(200).json({
		  	message:"Account successfully deleted..."
		  })
		}catch(err){
				return res.status(500).json({
			 	   message:'Server error: something went wrong, please try again later',
			 	   error:err
			 })
		}
	}else{
		return res.status(404).json({
			message:'User not Found!',
			error:404
		})
	}
}

module.exports = {
	profileUpdate,
	profileDelete
}