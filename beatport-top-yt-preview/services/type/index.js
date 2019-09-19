const models = require('./../../models');
const logger = require('./../../logger');

exports.getTypes = async () => {
  try {
    let typeObjects = await models.sequelize
      .query(
        'SELECT DISTINCT type ' + 
          'FROM top_tracks ' + 
         'WHERE type <> "top100" ' + 
         'ORDER BY type ASC',
        {replacements: {}, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
    let types = typeObjects.map((obj) => obj.type);
    types = ['top100', ...types];
    return types;
  } catch (error) {
    throw error;
  }
};