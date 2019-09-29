'use strict';

const merge = require('deepmerge');
const defaults = require('./default.json');
const env = process.env.NODE_ENV || 'development';
let config = require(`./${env}`);

/**
 * @typedef {Object} FetchConfig
 * @property {string} cronTime The Cron time format define frequency of actions 
 * @property {string} key The Youtube API key to fetch data on Youtube
 * @property {string} link Beatport Top 100's page link to be crawled
 */
/**
 * The fetching data configuration based on environment (development | test | production)
 * @type {Object.<string, FetchConfig>} Using label types for configuring objects
 * 
 * Format:
 * {
 *   "<type>": {
 *     "cronTime": "<cronTime>",
 *     "key": "<key>",
 *     "link": "<link>"
 *   }
 *   ...more
 * }
 * 
 * Example: 
 * {
 *   "top100" : {
 *     "cronTime": "0 1 0 * * *",
 *     "key": "YoutubeApiKey1",
 *     "link": "https://www.beatport.com/top-100"
 *   },
 *   "psy-trance" : {
 *     "cronTime": "0 0 0 * * *",
 *     "key": "YoutubeApiKey2",
 *     "link": "https://www.beatport.com/genre/psy-trance/13/top-100"
 *   }
 * }
 */
module.exports = merge.all([defaults, config]);
