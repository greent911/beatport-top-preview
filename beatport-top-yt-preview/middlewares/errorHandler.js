'use strict';

const AppError = require('./../errors/AppError');
const logger = require('./../utils/logger');

function logErrorStack(err) {
  if (err instanceof AppError) {
    logger.error(err.getFullStack());
  } else {
    logger.error(err.stack);
  }
}

function getErrorResponse(err) {
  let error = 'InternalServerError';
  if (err instanceof AppError) {
    error = (err.isPublic)? err.message: err.name;
  }
  return {
    error: error
  };
}

/**
 * Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  logErrorStack(err);
  res.status(err.status || 500);
  res.json(getErrorResponse(err));
}

module.exports = errorHandler;