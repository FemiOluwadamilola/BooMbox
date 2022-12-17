const cors = (req,res,next) => {
  res.headers('Access-Control-Allow-Origin', '*');
  res.headers('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
  if(req.method === 'OPTIONS'){
  	 res.headers('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  	 return res.status(200).json({})
  }
  next();
}

module.exports = cors;