/* eslint-disable no-console */
if (process.argv.length <= 2) {
  console.log('Example usage:');
  console.log('node ' + __filename.slice(__dirname.length + 1) + ' key [type [srclink]]');
  process.exit(-1);
}
let key = process.argv[2];
let type = process.argv[3] || 'top100';
let srclink = process.argv[4] || 'https://www.beatport.com/top-100';
const BeatportTopFetcher = require('beatporttopfetcher');
const models = require(`${__dirname}/../models`);
const logger = require(`${__dirname}/../logger`);
let fetcher = new BeatportTopFetcher(key);
async function save (top100list) {
  try {
    await models['top_track'].bulkCreate(top100list, {
      updateOnDuplicate: [],
      logging: logger.info
    });
  } catch (error) {
    logger.error('Save DB Error!!!!');
    throw error;
  } finally {
    models.sequelize.close();
  }
}
async function fetch () {
  try {
    let data = await fetcher.fetchList(type, srclink);
    console.log(data);
    await fetcher.getVideoIds();
    console.log(fetcher.top100list);
    await save(fetcher.top100list);
  } catch (error) {
    logger.error('Fetch Error!!!!');
    throw error;
  }
  console.log('Done');
}
fetch();