const logger = require('./logger');

class ErrorHandler {
  async handleError (err) {
    if (err.errors) {
      await logger.error(err.errors);
    } else {
      await logger.error(err.stack);
    }
    // await sendMail();
  }
}

module.exports = new ErrorHandler();