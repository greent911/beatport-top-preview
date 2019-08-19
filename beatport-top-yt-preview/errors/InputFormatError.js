const httpStatus = require('http-status');
const AppError = require('./AppError');

class InputFormatError extends AppError {
  constructor(message = 'Incorrect input format!', status = httpStatus.UNPROCESSABLE_ENTITY, isPublic = true, code = 422) {
    super(message, status, isPublic, code);
    this.name = 'InputFormatError';
  }
}

module.exports = InputFormatError;