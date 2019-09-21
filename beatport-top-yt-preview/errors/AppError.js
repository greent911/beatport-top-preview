const { BaseError, fullStack } = require('make-error-cause');

/** The application error interface */
class AppError extends BaseError {
  /**
   * @param {string} message The error message
   * @param {Object} options The error setting options
   * @param {number} options.status The http status
   * @param {boolean} options.isPublic The public flag
   * @param {number} options.code The custom error code
   * @param {Error} cause The caused by error
   */
  constructor(message, options, cause) {
    super(message, cause);
    this.message = message;
    this.name = this.constructor.name;
    this.status = options.status;
    this.isPublic = options.isPublic;
    this.code = options.code;
    Error.captureStackTrace(this, this.constructor.name);
  }

  // Get full error stack which includes cause stacks
  getFullStack() {
    return fullStack(this);
  }
}

module.exports = AppError;