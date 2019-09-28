'use strict';

const { param, sanitizeParam } = require('express-validator');
const requestValidationHandler = require('./../middlewares/requestValidationHandler');
const { trackService } = require('./../services');

/**
 * Returns the tracks
 * @type {Function[]} Request handler middlewares
 */
const getTracks = [
  /**
   * 1. VALIDATION RULES
   */
  [
    // If type exist from /:type, type must contain only letters and numbers (can be connected with dashes)
    param('type')
      .optional().isString().matches(/^[a-zA-Z0-9]*$|^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+$/)
      .withMessage('incorrect format')
  ],
  /**
   * 2. VALIDATE
   */
  requestValidationHandler,
  /**
   * 3. SANITIZE
   */
  [
    sanitizeParam('type').customSanitizer((value) => value || 'top100')
  ],
  /**
   * 4. HANDLE REQUEST
   */
  async (req, res, next) => {
    let { type } = req.params;
    try {
      let tracks = await trackService.getTracksByType(type);
      return res.json(tracks);
    } catch (err) {
      return next(err);
    }
  }
];

module.exports = {
  getTracks
};