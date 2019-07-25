const models = require('./../models');
const logger = require('./../logger');

exports.getTracks = [
  async (req, res, next) => {
    let type = req.params.type || 'top100';
    try {
      let results = await models.sequelize
        .query('SELECT * FROM top_tracks WHERE type=:type AND num BETWEEN 1 AND 100 ORDER BY num ASC',
          {replacements: { type: type }, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
      return res.json(results);
    } catch (error) {
      next(error);
    }
  }
];