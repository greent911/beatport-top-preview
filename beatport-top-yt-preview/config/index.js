'use strict';

// If there is a .env file, loads into environment variables
require('dotenv').config();

const dbConfig = require('./db');
const fetchConfig = require('./fetch');

module.exports = {
  db: dbConfig,
  fetch: fetchConfig,
  /* extend config type from here */
};