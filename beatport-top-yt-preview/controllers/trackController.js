const { param, validationResult } = require('express-validator');
const { trackService } = require('../services');
const { InputFormatError } = require('../errors');

function validateTypeInput() {
  return param('type').matches(/^[a-zA-Z0-9]*$|^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+$/)
    .withMessage('Incorrect input format');
}

exports.getTracks = [
  validateTypeInput(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errArray = errors.array();
      let message = errArray.reduce((prev, current) => {
        return prev + current.msg + ' : ' + current.value + '\n';
      }, '');
      message = message.slice(0, -1);
      return next(new InputFormatError(message));
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