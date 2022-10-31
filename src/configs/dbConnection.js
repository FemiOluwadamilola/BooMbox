require('dotenv').config();
const DB_url = process.env.MONGODB_URL;
const dbConnection = (DB) => {
  DB.connect(DB_url).then(() => console.log('DATABASE CONNECTION SUCCESSFULLY MADE...'))
  .catch(err => console.log(err.message))
}

module.exports = dbConnection;