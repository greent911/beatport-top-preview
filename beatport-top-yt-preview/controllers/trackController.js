const { param, validationResult } = require('express-validator');
const { trackService } = require('../services');

exports.getTracks = [
  param('type').matches(/^[a-zA-Z]*$|^[a-zA-Z]+[a-zA-Z-]*[a-zA-Z]+$/)
    .withMessage('Incorrect format!!'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors);
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