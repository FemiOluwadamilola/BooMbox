const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const {createReadStream, createWriteStream} = require('fs')
const DbConnection = require('./src/configs/dbConnection');
const cors = require('./src/middlewares/cors');
const userRoute = require('./src/routes/user');
const trackRoute = require('./src/routes/track');
const playlistRoute = require('./src/routes/playlist');
const app = express();

require('dotenv').config();

// const server = app.listen(PORT, () => console.log('SERVER RUNNING SUCCESSFULLY...'));
// const io = socketIo(server);

// database connection...
DbConnection(mongoose);

// cors
// app.use(cors());

// express middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());

/*ejs setup middlewares*/ 
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, "public")));


// routes
// app.use('/', homeRoute);
app.use('/api/users', userRoute);
app.use('/api/tracks', trackRoute);
app.use('/api/playlists', playlistRoute);

// routing error handler 
app.use((req,res,next) => {
   const err = new Error();
   if(err.status === 404){
	   	res.json({
			 message:'Page not found!',
			 error:err.message
		})
   }
   next(err);
})

// server error handler
app.use((err,req,res)=>{
	res.status(err.status || 500);
	res.json({
		err:{
		  message:err.message
		}
	})
})

// export app into server
module.exports = app;
