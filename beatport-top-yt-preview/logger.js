const { createLogger, format, transports } = require('winston');
// var path = require('path');
var util = require('util');
// var config = require('./config');

let options = {
  console: {
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.colorize(),
      format.json(),
      format.printf(({ level, message, timestamp }) => 
        `[${timestamp} ${level}] ` + util.format(message)
      )
    )
  },
  // file: {
  //   level: 'info',
  //   format: format.combine(
  //     format.timestamp({
  //       format: 'YYYY-MM-DD HH:mm:ss'
  //     }),
  //     format.printf(({ level, message, timestamp }) => 
  //       `[${timestamp} ${level}] ` + util.format(message)
  //     )
  //   ),
  //   filename: path.join(__dirname + config.logpath),
  //   maxsize: config.logsize,
  //   maxFiles: 1,
  //   tailable: true
  // }
};

const logger = createLogger({
  handleExceptions: true,
  // transports: [
  //   new transports.File(options.file),
  //   new transports.Console(options.console)
  // ],
  exitOnError: false
});

// if (config.env !== 'test') {
//   logger.add(new transports.File(options.file));
// }
logger.add(new transports.Console(options.console));

logger.stream = {
  write: function(message) {
    logger.info(message);
  },
};

module.exports = logger;