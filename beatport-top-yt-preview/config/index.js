require('dotenv').config();
const dbConfig = require('./db');
const genresConfig = require('./genres');
module.exports = {
  db: dbConfig,
  genres: genresConfig
};