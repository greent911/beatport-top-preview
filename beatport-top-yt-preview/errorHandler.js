const logger = require('./logger');

class ErrorHandler {
  async handleError (error) {
    await logger.error(error.stack);
    // await sendMail();
  }
}

module.exports = new ErrorHandler();