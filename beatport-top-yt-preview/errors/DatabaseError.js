const httpStatus = require('http-status');
const AppError = require('./AppError');

class DatabaseError extends AppError {
  constructor(message = 'Unknown database error', cause, options) {
    super(message, {
      status: (options && options.status)? options.status: httpStatus.INTERNAL_SERVER_ERROR,
      isPublic: (options && options.isPublic)? options.isPublic: false,
      code: (options && options.code)? options.code: 500
    }, cause);
    this.name = 'DatabaseError';
  }
}

module.exports = DatabaseError;