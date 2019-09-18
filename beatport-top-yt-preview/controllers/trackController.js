const { param, validationResult } = require('express-validator');
const { trackService } = require('../services');
const { InputFormatError } = require('../errors');

exports.getTracks = [
  [
    // VALIDATION RULES
    // Check type from /:type, type must contain only letters and numbers (can be connected with dashes)
    param('type').matches(/^[a-zA-Z0-9]*$|^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+$/)
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
  async (req, res, next) => {
    // HANDLE REQUEST
    let type = req.params.type || 'top100';
    try {
      let results = await trackService.getTracksByType(type);
      return res.json(results);
    } catch (error) {
      return next(error);
    }
  }
];