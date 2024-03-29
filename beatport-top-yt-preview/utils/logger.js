'use strict';

const util = require('util');
const { createLogger, format, transports } = require('winston');

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
};

const logger = createLogger({
  handleExceptions: true,
  exitOnError: false
});

logger.add(new transports.Console(options.console));

// For logging HTTP request from morgan middleware
logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

module.exports = logger;