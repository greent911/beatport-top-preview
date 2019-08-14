const logger = require('./logger');

class ErrorHandler {
  async handleError (err) {
    await logger.error(err.stack);
    // await sendMail();
  }
}

module.exports = new ErrorHandler();