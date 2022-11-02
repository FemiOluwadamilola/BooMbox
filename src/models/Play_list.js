const mongoose = require('mongoose');
const playListSchema = new mongoose.Schema({
 userId:{
 	type:mongoose.Schema.Types.ObjectId,
 	required:true
 },
 name:{
 	type:String,
 	required:true
 },
 tracks:{
 	type:Array
 }
},{timestamps:true});
const PlayList = mongoose.model('PlayList', playListSchema);
module.exports = PlayList;