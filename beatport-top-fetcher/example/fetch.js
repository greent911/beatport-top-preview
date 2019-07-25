const BeatportTopFetcher = require('beatporttopfetcher');
let fetcher = new BeatportTopFetcher();
let type = 'bass-house';
let srclink = 'https://www.beatport.com/genre/bass-house/91/top-100';
async function fetch () {
  let data = await fetcher.fetchList(type, srclink);
  console.log(data[0]);
}
fetch();