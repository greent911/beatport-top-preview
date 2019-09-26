'use strict';

const merge = require('deepmerge');
const defaults = require('./default.json');
const env = process.env.NODE_ENV || 'development';
let config = require(`./${env}`);

/**
 * @typedef {Object} GenreConfig
 * @property {string} cronTime The Cron time format define frequency of crawling actions 
 * @property {string} key The Youtube API key to fetch data on Youtube
 * @property {string} link The genre's page link to be crawled
 */
/**
 * The fetching data configuration for one or more genres by different environment (development | test | production)
 * @type {Object.<string, GenreConfig>}
 * 
 * Example: 
 * {
 *   "psy-trance" : {
 *     "cronTime": "0 0 0 * * *",
 *     "key": "YoutubeApiKey",
 *     "link": "https://www.beatport.com/genre/psy-trance/13/top-100"
 *   }
 * }
 */
module.exports = merge.all([defaults, config]);
