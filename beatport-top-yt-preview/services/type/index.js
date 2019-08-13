const models = require('../../models');
const logger = require('../../logger');

exports.getTypes = async () => {
  try {
    let results = await models.sequelize
      .query('SELECT DISTINCT type FROM top_tracks WHERE type!="top100" ORDER BY type ASC',
        {replacements: {}, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
    let resultArr = results.map((data) => data.type);
    resultArr = ['top100', ...resultArr];
    return resultArr;
  } catch (error) {
    throw error;
  }
};