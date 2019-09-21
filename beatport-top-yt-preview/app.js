const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const config = require('./config');
const indexRouter = require('./routes/index');
const logger = require('./logger');
const scheduler = require('./core/scheduler');
const sequelize = require('./models').sequelize;
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Test the database connection
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

// job schedule setup
scheduler(config.genres);

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

app.use('/', indexRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
