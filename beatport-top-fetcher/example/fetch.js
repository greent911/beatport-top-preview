'use strict';

const BeatportTopFetcher = require('beatporttopfetcher');
let fetcher = new BeatportTopFetcher();
let type = 'bass-house';
let link = 'https://www.beatport.com/genre/bass-house/91/top-100';
async function fetch() {
  let data = await fetcher.crawl(link, type);
  console.log(data[0]);
}
fetch();