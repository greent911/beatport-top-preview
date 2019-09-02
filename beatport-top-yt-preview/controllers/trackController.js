const { param, validationResult } = require('express-validator');
const logger = require('../logger');
const { trackService } = require('../services');
const { InputFormatError } = require('../errors');

function validateTypeInput() {
  return param('type').matches(/^[a-zA-Z0-9]*$|^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+$/)
    .withMessage('Incorrect format!');
}

exports.getTracks = [
  validateTypeInput(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(422).json({ errors: errors.array() });
      logger.error(errors.array());
      return next(new InputFormatError());
    }
    let type = req.params.type || 'top100';
    try {
      let results = await trackService.getTracksByType(type);
      return res.json(results);
    } catch (error) {
      return next(error);
    }
  }
];