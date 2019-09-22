const { typeService } = require('./../services');

/**
 * Returns the tracks
 * @type {Function[]} Request handler middleware
 */
const getTypes = [
  async (req, res, next) => {
    try {
      let types = await typeService.getTypes();
      return res.json(types);
    } catch (err) {
      return next(err);
    }
  }
];

module.exports = {
  getTypes
};