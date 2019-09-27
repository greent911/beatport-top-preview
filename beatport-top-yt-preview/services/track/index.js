'use strict';

const { DatabaseError } = require('./../../errors');
const logger = require('./../../utils/logger');
const models = require('./../../models');
const utils = require('./../../utils');

/**
 * The top track
 * @typedef {Object} Track
 * @property {number} num The track's top rank number
 * @property {string} type The track's type in database
 * @property {string} title The track's title
 * @property {string} artists The track's artist(s)
 * @property {string} [remixers] The track's remixer(s)
 * @property {string} [labels] The track's label(s)
 * @property {string} [genre] The track's genre
 * @property {string} [released] The track's released Date, YYYY-MM-DD
 * @property {string} link The track's page relative link on Beatport
 * @property {string} [imglink] The track's album artwork image link
 * @property {string} [video_id] The track's Youtube video ID
 * @property {string} [created_at] The number row data's created date (Auto-inserted by sequelize bulkCreate())
 * @property {string} [updated_at] The number row data's updated date (Auto-inserted by sequelize bulkCreate())
 */
/**
 * @param {*} type
 * @returns {Promise<Track[]>} A promise that contains the array of tracks when fulfilled.
 * @throws {DatabaseError}
 */
const getTracksByType = async (type) => {
  try {
    let tracks = await models.sequelize
      .query(
        'SELECT num, type, title, artists, remixers, labels, genre, released, link, imglink, video_id, created_at, updated_at ' +
          'FROM top_tracks ' + 
         'WHERE type = :type ' + 
           'AND num BETWEEN 1 AND 100 ' + 
         'ORDER BY num ASC',
        {replacements: { type: utils.parseString(type) }, type: models.sequelize.QueryTypes.SELECT, logging: logger.info});
    return tracks;
  } catch (err) {
    throw new DatabaseError(err.message, err);
  }
};

/**
 * @param {Track[]} tracks 
 * @throws {DatabaseError}
 */
const upsertTracks = async (tracks) => {
  try {
    await models['top_track'].bulkCreate(tracks, {
      updateOnDuplicate: [],
      logging: logger.info
    });
  } catch (err) {
    throw new DatabaseError(err.message, err);
  }
};

module.exports = {
  getTracksByType,
  upsertTracks
};