const logger = require('./logger');

class ErrorHandler {
  async handleError (err) {
    await logger.error(err.stack);
    // await sendMail();
  }
  async handleErrorMessage (msg) {
    await logger.error(msg);
    // await sendMail();
  }
}

module.exports = new ErrorHandler();