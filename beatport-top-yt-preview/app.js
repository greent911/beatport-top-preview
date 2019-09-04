var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var helmet = require('helmet');

var config = require('./config');
var indexRouter = require('./routes/index');
var logger = require('./logger');
var scheduler = require('./core/scheduler');
var errorHandler = require('./errorHandler');
var sequelize = require('./models').sequelize;

var app = express();

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database: ', err);
    errorHandler.handleError(err);
    // process.exit(1);
  });

// job schedule setup
scheduler(config.genres);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('strict routing', true);
app.use(helmet());
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url" :status :response-time ms :res[content-length] ":user-agent"', 
  { stream: logger.stream }
));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// handle 404
app.use(function(req, res) {
  res.status(404).send('Sorry cant find that!');
});

// error handler (must have next)
app.use(async function(err, req, res, next) {
  await errorHandler.handleError(err);
  res.status(err.status || 500);
  res.send({ error: err.isPublic ? err.message : 'Something broke!' });
});

module.exports = app;
