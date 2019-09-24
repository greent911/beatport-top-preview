'use strict';

const httpStatus = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('./../utils/logger');

/**
 * Format ValidationError object to string
 * @param {Object} error The ValidationError object
 * @param {string} error.location Location of the param, it's either body, query, params, cookies or headers.
 * @param {string} error.msg The error message
 * @param {string} error.param The parameter name
 * @returns {string}
 */
function formatError({ location, msg, param }) {
  return `${location}[${param}]: ${msg}`;
}

/**
 * Request Validation Handling Middleware
 */
function requestValidationHandler(req, res, next) {
  const result = validationResult(req);
  const hasNoError = result.isEmpty();
  if (hasNoError) {
    return next();
  }
  let errors = result.array();
  // Log validation error objects 
  logger.info(errors);
  // Format errors for response
  errors = errors.map(formatError);
  res.status(httpStatus.UNPROCESSABLE_ENTITY);
  return res.json({
    message: 'Request input validation error',
    errors: errors
  });
}

module.exports = requestValidationHandler;