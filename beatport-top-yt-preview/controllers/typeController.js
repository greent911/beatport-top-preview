const { typeService } = require('../services');

exports.getTypes = [
  async (req, res, next) => {
    try {
      let types = await typeService.getTypes();
      return res.json(types);
    } catch (error) {
      return next(error);
    }
  }
];