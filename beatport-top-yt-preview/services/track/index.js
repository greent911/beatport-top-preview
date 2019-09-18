const { parseString } = require('./../../utils');
const models = require('./../../models');
const logger = require('./../../logger');

exports.getTracksByType = async (type) => {
  try {
    let tracks = await models.sequelize
      .query('SELECT * FROM top_tracks WHERE type=:type AND num BETWEEN 1 AND 100 ORDER BY num ASC',
        {replacements: { type: parseString(type) }, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
    return tracks;
  } catch (error) {
    throw error;
  }
};