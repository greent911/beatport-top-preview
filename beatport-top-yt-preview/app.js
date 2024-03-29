'use strict';

const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const fetchConfig = require('./config').fetch;
const fetchScheduler = require('./core/fetchScheduler');
const logger = require('./utils/logger');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');
const sequelize = require('./models').sequelize;
const routes = require('./routes');

const app = express();

// Test the database connection
logger.info('Testing database connection...');
sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connection has been established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database: ', err);
    logger.error(err.stack);
    // process.exit(1);
  });

// Fetching job schedule setup
fetchScheduler.setupFetchingJobs(fetchConfig);

app.set('strict routing', true);
app.use(helmet());
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url" :status :response-time ms :res[content-length] ":user-agent"', 
  { stream: logger.stream }
));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
