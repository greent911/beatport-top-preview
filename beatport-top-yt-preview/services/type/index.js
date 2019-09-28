'use strict';

const { DatabaseError } = require('./../../errors');
const models = require('./../../models');

/**
 * @returns {Promise<string[]>} A promise that contains array of types when fulfilled.
 * @throws {DatabaseError}
 */
const getTypes = async () => {
  try {
    let typeObjects = await models['top_track'].getTypes();
    let types = typeObjects.map((obj) => obj.type);
    return types;
  } catch (err) {
    throw new DatabaseError(err.message, err);
  }
};

module.exports = {
  getTypes
};