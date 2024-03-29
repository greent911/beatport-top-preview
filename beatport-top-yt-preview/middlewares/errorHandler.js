'use strict';

const AppError = require('./../errors/AppError');
const logger = require('./../utils/logger');

const logErrorStack = (err) => {
  if (err instanceof AppError) {
    logger.error(err.getFullStack());
  } else {
    logger.error(err.stack);
  }
};

const getErrorResponse = (err) => {
  let error = 'InternalServerError';
  if (err instanceof AppError) {
    error = (err.isPublic)? err.message: err.name;
  }
  return {
    error: error
  };
};

/**
 * Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  logErrorStack(err);
  res.status(err.status || 500);
  res.json(getErrorResponse(err));
};

module.exports = errorHandler;