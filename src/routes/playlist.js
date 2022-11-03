const router = require('express').Router();
const User = require('../models/User');
const Track = require('../models/Track');
const PlayList = require('../models/Play_list');
const verifyToken = require('../middlewares/Auth_verify');

// CREATE TRACK PLAYLIST
router.post('/', verifyToken, async (req,res) => {
  try{
 	 const user = await User.findById(req.user.id);
 	 if(user){
		 	const playList = await new PlayList({
		 		userId:user.id,
		 		name:req.body.name
		 	})
		  const playListName = await PlayList.findOne({name:req.body.name});
		  if(playListName){
		  	return res.status(403).json({
		  		 message:'Oops this playlist name already in use'
		  	})
		  }else{
			  const my_playlist = await playList.save();
		    if(!user.play_list.includes(my_playlist.id)){
		    	await User.updateOne({$push:{play_list:my_playlist.id}})
			     res.status(201).json({
			    	response:{
			    		 message:'playlist created',
			    		 playlist:{
			    		 	 id:my_playlist.id,
			    		 	 name:my_playlist.name
			    		 },
			    		 request:{
			    		 	  type:'PUT',
			    		 	  description:'UPLOAD_TRACK_TO_PLAYLIST',
			    		 	  url:`${process.env.BOOMBOX_URL}/playlists`
			    		 }
			    	}
			    });
		    }else{
		    	return res.status(403).json({
		    		 message:'PlayList already created...'
		    	})
		    }
		  }
 	 }else{
 	 	return res.status(403).json({message:'Auth failed'})
 	 }
  }catch(err){
  	 return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
  }
})

// ADD TRACKS TO PLAYLIST
router.put('/', verifyToken, async (req,res) => {
	  try{
	 	 const playList = await PlayList.findById(req.body.playlistId);
	 	 if(playList){
	 	 	if(playList.userId === req.user.id){
	 	 	 if(playList.tracks.includes(req.body.trackId)){
	 	 	 	  await PlayList.updateOne({$push:{tracks:req.body.trackId}})
	 	 	 	  res.status(201).json({
	 	 	 	  	response:{
	 	 	 	  		 message:'Track added to playlist',
	 	 	 	  		 request:{
	 	 	 	  		 	 type:'GET',
	 	 	 	  		 	 description:'GET_TRACKS_IN_PLAYLIST',
	 	 	 	  		 	 url:`${process.env.BOOMBOX_URL}/playlists`
	 	 	 	  		 }
	 	 	 	  	}
	 	 	 	  })
	 	 	 }else{
	 	 	 	 return res.status(404).json({message:'Track already in playlist'})
	 	 	 }
	 	 }else{
	 	 	 return res.status(403).json({message:'Oops something went wrong!!!'})
	 	 }
	 	 }else{
	 	 	 return res.status(404).json({message:'Oops sorry playlist not found!'})
	 	 }
	 }catch(err){
	 	  return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	 }
})


// VIEW PLAYLISTS
router.get('/', verifyToken, async (req,res) => {
	try{
		const user = await User.findById(req.user.id);
		if(user){
			const playList = await PlayList.find();
			if(playList.userId === user.id){
				 // res.status(200).json({
				 // 	  playlist:playList.name
				 // })
				 console.log(playList.name)
			}else{
				 return res.status(404).json({
				 	  message:'Playlist not found!'
				 })
			}
		}else{
			 return res.status(403).json({message:'Auth failed'})
		}
	}catch(err){
		  return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
})


// SHARE PLAYLIST WITH FRIEND
router.get('/:id/share_playlist', verifyToken, async (req,res) => {
	try{

	}catch(err){
		 return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
})

// GET PLAYLIST FROM FRIEND
router.get('/get_playlist', verifyToken, async(req,res) => {
	try{
		const playlist = await PlayList.findById(req.body.playlistId);
		if(playlist){
			const user = await User.findById(req.user.id);
			const friend = await User.findById(playlist.userId);
			if(!user.play_list.includes(playlist.id)){
				 await User.updateOne({$push:{play_list:playlist.id}});
				 res.status(201).json({
				 	  response:{
				 	  	message:`${friend.username} playlist is now sync with yours!`
				 	  }
				 })
			}else{
				return res.status(403).json({
				 	  message:'Oops sorry playlist can only be shared once!'
				 })
			}
		}else{
			return res.status(404).json({
				 message:'Playlist not found!'
			})
		}
	}catch(err){
		 return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
})

// DELETE PLAYLIST
router.delete('/:id', verifyToken, async (req,res) => {
	try{
	  const playlist = await PlayList.findById(req.params.id);
	  const user = await User.findById(req.user.id);
		if(playlist){
			 if(user.play_list.includes(playlist.id)){
			 	  await User.updateOne({$pull:{play_list:playlist.id}})
			 	  await PlayList.findByIdAndDelete(playlist.id);
			 	  res.status(200).json({
			 	  	response:{
			 	  		 message:"Playlist deleted...",
			 	  	}
			 	  })
			 }else{
			 	 return res.status(403).json({
			 	 	  message:'Playlist already delete!'
			 	 })
			 }
		}else{
			 return res.status(404).json({
			 	 message:'Playlist not found!'
			 })
		}
	}catch(err){
		  return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
})

module.exports = router;
