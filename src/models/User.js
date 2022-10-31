const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    play_list:{
        type:Array
    },
    following:{
    	type:Array
    },
    followers:{
    	type:Array
    }
},{
    timestamps:true
})

const User = mongoose.model('User', userSchema);

module.exports = User;