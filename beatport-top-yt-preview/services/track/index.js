const models = require('./../../models');
const logger = require('./../../logger');

exports.getTracksByType = async (type) => {
  try {
    let results = await models.sequelize
      .query('SELECT * FROM top_tracks WHERE type=:type AND num BETWEEN 1 AND 100 ORDER BY num ASC',
        {replacements: { type: type }, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
    return results;
  } catch (error) {
    throw error;
  }
};