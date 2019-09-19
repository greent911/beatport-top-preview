const { param, validationResult, sanitizeParam } = require('express-validator');
const { trackService } = require('../services');
const { InputFormatError } = require('../errors');

/**
 * Returns the tracks
 * @type {Function[]} Request handler middlewares
 */
const getTracks = [
  [
    // VALIDATION RULES
    // Check if type exist from /:type, type must contain only letters and numbers (can be connected with dashes)
    param('type')
      .optional().isString().matches(/^[a-zA-Z0-9]*$|^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+$/)
      .withMessage('Incorrect input format')
  ],
  (req, res, next) => {
    // VALIDATE
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    let errorMessage = errors.array().reduce((prev, current) => {
      return prev + current.msg + ' : ' + current.value + '\n';
    }, '').slice(0, -1);
    return next(new InputFormatError(errorMessage));
  },
  [
    // SANITIZE
    sanitizeParam('type').customSanitizer((value) => (value)? value: 'top100')
  ],
  async (req, res, next) => {
    // HANDLE REQUEST
    let { type } = req.params;
    try {
      let tracks = await trackService.getTracksByType(type);
      return res.json(tracks);
    } catch (error) {
      return next(error);
    }
  }
];

module.exports = {
  getTracks
};