const { param, validationResult } = require('express-validator');
const logger = require('../logger');
const { trackService } = require('../services');

function validateTypeInput() {
  return param('type').matches(/^[a-zA-Z]*$|^[a-zA-Z]+[a-zA-Z-]*[a-zA-Z]+$/)
    .withMessage('Incorrect format!!');
}

exports.getTracks = [
  validateTypeInput(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(errors);
      return res.status(422).json({ errors: errors.array() });
    }
    let type = req.params.type || 'top100';
    try {
      let results = await trackService.getTracksByType(type);
      return res.json(results);
    } catch (error) {
      next(error);
    }
  }
];