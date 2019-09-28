'use strict';

// If there is a .env file, loads environment variables
require('dotenv').config();

const dbConfig = require('./db');
const fetchConfig = require('./fetch');

module.exports = {
  db: dbConfig,
  fetch: fetchConfig
};