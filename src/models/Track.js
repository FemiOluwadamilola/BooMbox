const mongoose = require('mongoose')
const trackSchema = new mongoose.Schema({
	userId:{
		type:mongoose.Schema.Types.ObjectId,
		required:true
	},
	title:{
	   type:String,
	   required:true
	},
	audio:{
	   type:String,
	   required:true,
	},
	likes:{
	   type:Array
	},
	comments:{
		type:Array
	}
},{timestamps:true})

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;