const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const Track = require('../models/Track');
const PlayList = require('../models/Play_list');
const verifyToken = require('../middlewares/Auth_verify');

// get all tracks
router.get('/', async (req,res) => {
	try{
	   const tracks = await Track.find().select('userId title audio likes comments').sort({createdAt:-1});
	   res.status(200).json({
	   	 response:{
	   	 	 object_count:tracks.length,
		   	 results:tracks.map(doc => {
		   	 	return{
	   	 		   track:{
			   	 		_id:doc._id,
			   	 		title:doc.title,
				   	 	audio:doc.audio,
				   	 	likes:doc.likes,
				   	 	comments:doc.comments
		   	 		},
		   	 		request:{
			   	 	   type:'GET',
			   	 	   description:'STREAM_TRACK',
			   	 	   url:`http://localhost:5000/api/tracks/${doc._id}/`
		   	 		}
		   	 	}
		   	 })
	   	 }
	   });
	}catch(err){
		return res.status(500).json({error:err.message})
	}
});

//track upload
router.post('/', verifyToken, async (req,res) => {
	 try{
   		const user = await User.findById(req.user.id);
   	   if(user){
   	   	      const storage = multer.diskStorage({
  		 	 destination:'./tracks_uploads',
  		 	 filename:(req,file,cb) => {
  		 	 	 cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
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
			  		  	 	  	 url:'http://localhost:5000/api/tracks'
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
	 	 return res.status(500).json({error:err})
	 }
}) 

// delete track
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
	  		 					url:`http://localhost:5000/api/tracks/`,
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
	  	  return res.status(403).json({message:'Oops action forbidden...'})
	  	}
	  }else{
	  	return res.status(403).json({message:'Oops sorry this user cannot delete this track'});
	  }
	}catch(err){
		return res.status(500).json({error:err});
	}
})

// Stream track
router.get('/:id', async (req,res) => {
	try{
		const track = await Track.findById(req.params.id);
		if(track){
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
			error:err
		})
	}
});

module.exports = router;