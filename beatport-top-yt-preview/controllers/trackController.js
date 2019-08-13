const {trackService} = require('../services');

exports.getTracks = [
  async (req, res, next) => {
    let type = req.params.type || 'top100';
    try {
      let results = await trackService.getTracksByType(type);
      return res.json(results);
    } catch (error) {
      next(error);
    }
  }
];