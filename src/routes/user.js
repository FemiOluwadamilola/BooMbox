const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const verifyToken = require('../middlewares/Auth_verify');


// UPDATE USER PROFILE
router.put('/', verifyToken, async (req,res) => {
	const user = await User.findById(req.user.id)
  if(user){
  	if(req.body.password){
  		try{
  		  res.body.password = bcrypt.hash(req.body.password, bcrypt.genSalt(10))
  		}catch(err){
  			return res.status(500).json({
			 	  response:{
			 	  	 message:'Server error: something went wrong, please try again later',
			 	 		 error:err
			 	  }
			 })
  		}
  	}else{
  		try{
  		  const updatedUserInfo = await User.findByIdAndUpdate(req.params.id,{
  		  	$set: req.body
  		  },{new:true})
  		}catch(err){
  			return res.status(500).json({
			 	  response:{
			 	  	 message:'Server error: something went wrong, please try again later',
			 	 		 error:err
			 	  }
			 })
  		}
  	}
  }else{
  	return res.status(404).json({
			response:{
				message:'User not Found!'
			}
		})
  }
})

// DELETE USER ACCOUNT
router.delete('/', verifyToken, async (req,res) => {
	const user = await User.findById(req.user.id);
	if(user){
		try{
		  await User.findByIdAndDelete(req.params.id);
		  res.status(200).json({
		  	response:{
		  		message:"Account successfully deleted..."
		  	}
		  })
		}catch(err){
				return res.status(500).json({
			 	  response:{
			 	  	 message:'Server error: something went wrong, please try again later',
			 	 		 error:err
			 	  }
			 })
		}
	}else{
		return res.status(404).json({
			response:{
				message:'User not Found!'
			}
		})
	}
})
module.exports = router;