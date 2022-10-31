const mongoose = require('mongoose');
const playListSchema = new mongoose.Schema({
 userId:{
 	type:String,
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