// If there is a .env file, loads into environment variables
require('dotenv').config();
const dbConfig = require('./db');
const genresConfig = require('./genres');
module.exports = {
  db: dbConfig,
  genres: genresConfig,
  /* extend config type from here */
};