const { DatabaseError } = require('./../../errors');
const logger = require('./../../logger');
const models = require('./../../models');

/**
 * @returns {Promise<string[]>} A promise that contains array of types when fulfilled.
 * @throws {DatabaseError}
 */
const getTypes = async () => {
  try {
    let typeObjects = await models.sequelize
      .query(
        'SELECT DISTINCT type ' + 
          'FROM top_tracks ' + 
         'WHERE type <> \'top100\' ' + 
         'ORDER BY type ASC',
        {replacements: {}, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
    let types = typeObjects.map((obj) => obj.type);
    types = ['top100', ...types];
    return types;
  } catch (err) {
    throw new DatabaseError(err.message, err);
  }
};

module.exports = {
  getTypes
};