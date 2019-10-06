'use strict';

/**
 * Top 100 Tracks Fetch Script
 */
/* eslint-disable no-console */
if (process.argv.length <= 2) {
  console.log('Example usage:');
  console.log('node ' + __filename.slice(__dirname.length + 1) + ' key [pagelink [type]]');
  process.exit(-1);
}

const models = require(`${__dirname}/../models`);
const { trackService } = require(`${__dirname}/../services`);

let key = process.argv[2];
let pagelink = process.argv[3] || 'https://www.beatport.com/top-100';
let type = process.argv[4] || 'top100';

const save = async (tracks) => {
  try {
    await trackService.upsertTopTracks(tracks);
  } catch (err) {
    console.error('Save top tracks into Database error');
    throw err;
  } finally {
    models.sequelize.close();
  }
};

const run = async () => {
  try {
    let tracks = await trackService.fetchTopTracks({
      key,
      pagelink,
      type,
    });
    console.log(tracks);
    await save(tracks);
  } catch (err) {
    console.error(`Fetch top tracks error - Page link: ${pagelink}, Youtube Data API key: ${key}`);
    throw err;
  }
  console.log('Fetch completed');
};

/**
 * START
 */
run();