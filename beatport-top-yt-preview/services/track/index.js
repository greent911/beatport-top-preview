'use strict';

const BeatportTopFetcher = require('beatport-top-fetcher');

const { DatabaseError } = require('./../../errors');
const models = require('./../../models');

/**
 * The top track data fields
 * @typedef {Object} TopTrack
 * @property {number} num The top rank number
 * @property {string} type The type of top track data
 * @property {string} title The track's title
 * @property {string} artists The track's artist(s)
 * @property {string} remixers The track's remixer(s)
 * @property {string} labels The track's label(s)
 * @property {string} genre The track's genre
 * @property {string} released The track's released Date, YYYY-MM-DD
 * @property {string} link The track's page relative link on Beatport
 * @property {string} imglink The track's album artwork image link
 * @property {string} video_id The track's Youtube video ID
 * @property {string} created_at The created date (Auto-inserted by sequelize bulkCreate())
 * @property {string} updated_at The updated date (Auto-inserted by sequelize bulkCreate())
 */
/**
 * Get top tracks from database
 * @param {string} type The type of top track data
 * @param {string[]} [fields] The data fields can be specified (All fields are included by default)
 * @returns {Promise<TopTrack[]>} A promise that contains the array of top tracks when fulfilled.
 * @throws {DatabaseError}
 */
const getTopTracksByType = async (type, fields) => {
  try {
    let tracks = await models['top_track'].getByType(type, fields);
    return tracks;
  } catch (err) {
    throw new DatabaseError(err.message, err);
  }
};

/**
 * Fetch top tracks from Beatport and Youtube
 * @param {Object} settings
 * @param {string} settings.key Youtube Data API key
 * @param {string} settings.pagelink Beatport top 100's page link to be crawled
 * @param {string} [settings.type] The type of top track data
 * @param {string[]} [settings.fields] The data fields can be specified (All fields are included by default)
 * @returns {Promise<TopTrack[]>} A promise that contains the array of top tracks when fulfilled.
 */
const fetchTopTracks = async ({ key, pagelink, type = 'top100', fields }) => {
  let fetcher = new BeatportTopFetcher(key);
  let tracks;

  try {
    tracks = await fetcher.fetchTracks(pagelink, fields);
  } catch (err) {
    throw err;
  }

  tracks.forEach((track) => {
    track.type = type;
  });

  return tracks;
};

/**
 * Update or insert top tracks into database
 * @param {TopTrack[]} tracks 
 * @throws {DatabaseError}
 */
const upsertTopTracks = async (tracks) => {
  try {
    await models['top_track'].upsert(tracks);
  } catch (err) {
    throw new DatabaseError(err.message, err);
  }
};

module.exports = {
  getTopTracksByType,
  fetchTopTracks,
  upsertTopTracks
};