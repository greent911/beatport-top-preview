'use strict';

/**
 * Top 100 Tracks Fetch Script
 */
/* eslint-disable no-console */
if (process.argv.length <= 2) {
  console.log('Example usage:');
  console.log('node ' + __filename.slice(__dirname.length + 1) + ' key [type [link]]');
  process.exit(-1);
}

const BeatportTopFetcher = require('beatporttopfetcher');
const models = require(`${__dirname}/../models`);
const { trackService } = require(`${__dirname}/../services`);

let key = process.argv[2];
let type = process.argv[3] || 'top100';
let link = process.argv[4] || 'https://www.beatport.com/top-100';
let fetcher = new BeatportTopFetcher(key);

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
 */
/**
 * Save tracks into database
 * @param {Track[]} tracks 
 */
const save = async (tracks) => {
  try {
    await trackService.upsertTracks(tracks);
  } catch (err) {
    console.error('Save tracks into Database error');
    throw err;
  } finally {
    models.sequelize.close();
  }
};

const fetch = async () => {
  try {
    let tracks = await fetcher.fetchTracks(link, type);
    console.log(tracks);
    await save(tracks);
  } catch (err) {
    console.error(`Fetch tracks error from ${link} with Youtube API key: ${key}`);
    throw err;
  }
  console.log('Fetch completed');
};

/**
 * START FETCHING
 */
fetch();