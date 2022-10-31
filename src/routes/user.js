const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');


// update user profile
router.put('/:id', async (req,res) => {
  if(req.body.userId === req.params.id){
  	if(req.body.password){
  		try{
  		  res.body.password = bcrypt.hash(req.body.password, bcrypt.genSalt(10))
  		}catch(err){
  			return res.status(500).json({err_message:err.message});
  		}
  	}else{
  		try{
  		  const updatedUserInfo = await User.findByIdAndUpdate(req.params.id,{
  		  	$set: req.body
  		  },{new:true})
  		}catch(err){
  			return res.status(500).json({err_message:err.message})
  		}
  	}
  }else{
  	res.status(404).json({err_message:'Invalid user id'})
  }
})

// delete user account
router.delete('/:id', async (req,res) => {
	if(req.body.userId === req.params.id){
		try{
		  await User.findByIdAndDelete(req.params.id);
		  res.status(200).json({success_msg:"Account successfully deleted..."})
		}catch(err){
			return res.status(500).json({err_message:err.message});
		}
	}else{
		return res.status(403).json({err_message:'Invalid User Id'})
	}
})
module.exports = router;