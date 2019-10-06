'use strict';

const { typeService } = require('./../services');

/**
 * Handle a request for the types
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