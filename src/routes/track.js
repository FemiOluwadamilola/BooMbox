const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const Track = require('../models/Track');
const PlayList = require('../models/Play_list');
const verifyToken = require('../middlewares/Auth_verify');

// GET ALL TRACKS ROUTE
router.get('/', async (req,res) => {
	try{
	   const tracks = await Track.find().select('userId title audio stream_counts likes comments').sort({createdAt:-1});
	   res.status(200).json({
	   	 response:{
	   	 	 object_count:tracks.length,
		   	 results:tracks.map(doc => {
		   	 	return{
	   	 		   track:{
			   	 		_id:doc._id,
			   	 		title:doc.title,
				   	 	audio:doc.audio,
				   	 	streamed:doc.stream_counts,
				   	 	likes:doc.likes,
				   	 	comments:doc.comments
		   	 		},
		   	 		requests:{
			   	 	  stream:{
				   	 	   type:'GET',
				   	 	   description:'STREAM_TRACK',
				   	 	   url:`${process.env.BOOMBOX_URL}/tracks/${doc._id}/`
			   	 	  },
			   	 	  download:{
			   	 	  	   type:'GET',
				   	 	   description:'DOWNLOAD_TRACK',
				   	 	   url:`${process.env.BOOMBOX_URL}/tracks/download/${doc._id}/`
			   	 	  }
		   	 		}
		   	 	}
		   	 })
	   	 }
	   });
	}catch(err){
		return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
});

//TRACK UPLOAD ROUTE
router.post('/', verifyToken, async (req,res) => {
	 try{
   		const user = await User.findById(req.user.id);
   	   if(user){
   	   	      const storage = multer.diskStorage({
  		 	 destination:'./tracks_uploads',
  		 	 filename:(req,file,cb) => {
  		 	 	 cb(null, "AUD" +"_"+ Date.now() + path.extname(file.originalname))
  		 	 }
  		 })
  		 const track = multer({
  		 	 storage,
  		 	 fileFilter:(req,file,cb) => {
  		 	 	  const extname = path.extname(file.originalname);
  		 	 	  if(extname !== '.mp3'){
  		 	 	  	 res.status(403).json({
  		 	 	  	 	status_code:'403',
  		 	 	  	 	message:"accept only .mp3 file only"
  		 	 	  	 })
  		 	 	  }else{
  		 	 	  	cb(null, true)
  		 	 	  }
  		 	 }
  		 }).single("audio");
  		 track(req,res, async (err) => {
  		 	 try{
	  		 	  if(err){
	  		 	  	 return res.status(500).json({error:err});
	  		 	  }else{
		  		  		const newTrack = await new Track({
		  		  			userId:req.user.id,
		  		  			title:req.body.title,
		  		  			audio:req.file.filename,
		  		  			path:req.file.path,
		  		  		});

		  		  	 const savedTrack = await newTrack.save();
		  		  	 res.status(201).json({
		  		  	 	response:{
		  		  	 		message:'Track uploaded successfully...',
			  		  	 	track:{
			  		  	 		_id:savedTrack._id,
			  		  	 		title:savedTrack.title,
			  		  	 		audio:savedTrack.audio,
			  		  	 	},
			  		  	 	 request:{
			  		  	 	  	 type:'GET',
			  		  	 	  	 description:'GET_TRACKS',
			  		  	 	  	 url:`${process.env.BOOMBOX_URL}/tracks/`
			  		  	 	  }
		  		  	 	}
		  		  	 });
	  		 	  }
	  		 	 }catch(err){
	  		 	 	return res.status(500).json({error:err})
	  		 	 }
	  		 })
   	   }else{
   	   	 return res.status('403').json({
   	   	 	message:'Authorization denied'
   	   	 })
   	   }
	 }catch(err){
	 	return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	 }
}) 

// DELETE TRACK ROUTE
router.delete('/:id', verifyToken, async (req,res) => {
	try{
	  const user = await User.findById(req.user.id);
	  if(user){
	  	const track = await Track.findById(req.params.id);
	  	if(track){
	  		fs.stat(path.join(__dirname, '../../tracks_uploads'), (err) => {
	  		if(err){
	  			res.status("404").json({message: "File directory does not exist" });
	  		 }else{
	  		 	  fs.unlink(path.join(__dirname, `../../tracks_uploads/${track.audio}`), async (err) => {
	  		 		 if(err) throw err.message
	  		 		await Track.findByIdAndDelete(req.params.id);
	  		 		res.status(200).json({
	  		 			response:{
	  		 				message: "track successfully deleted...",
	  		 				request:{
	  		 					type:'POST',
	  		 					description:"UPLOAD_TRACK",
	  		 					url:`${process.env.BOOMBOX_URL}/tracks/`,
	  		 					body:{
	  		 					   title:'String',
	  		 					   audio:'File'
	  		 					} 
	  		 				}
	  		 			}
	  		 		});
	  		 	})
	  		 }
	  		})
	  	}else{
	  	  return res.status(403).json({message:'Track already deleted from the database...'})
	  	}
	  }else{
	  	return res.status(403).json({message:'Oops sorry this user cannot delete this track'});
	  }
	}catch(err){
		return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 });
	}
})

// TRACK STREAMING ROUTE
router.get('/:id', async (req,res) => {
	try{
		const track = await Track.findById(req.params.id);
		if(track){
			if(track.stream_counts >= 0){
				const streamed = track.stream_counts += 1;
				await Track.findByIdAndUpdate(req.params.id,{
			    	$set:{
			    	  stream_counts:streamed
			    	}
		    	})
			}
			 res.writeHead(200,{'content-Type':'audio/mp3'});
		   	 const stream = fs.createReadStream(path.join(__dirname,`../../tracks_uploads/${track.audio}`));
		   	 stream.pipe(res);
		}else{
		   return res.status(404).json({
		   	 message:'Track not found!'
		   })
		}
	}catch(err){
		return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
});

// TRACK DOWNLOAD ROUTE
router.get('/download/:id',verifyToken, async (req,res) => {
	try{
	  const user = await User.findById(req.user.id)
	  if(user){
		  const track = await Track.findById(req.params.id);
		  if(track){
		  	 res.download(track.path,track.audio)
		  }else{
		  	 return res.status(404).json({
		  	 	message:'Track not found'
		  	 })
		  }
	  }else{
	  	 return res.status(403).json({
	  	 	 message:'Please signup to download'
	  	 })
	  }
	}catch(err){
	   return res.status(500).json({
		 	 message:'Server error: something went wrong, please try again later',
		 	 error:err
		 })
	}
});



module.exports = router;