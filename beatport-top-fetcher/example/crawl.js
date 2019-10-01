'use strict';

const BeatportTopFetcher = require('beatport-top-fetcher');
let fetcher = new BeatportTopFetcher();
let type = 'bass-house';
let link = 'https://www.beatport.com/genre/bass-house/91/top-100';
const crawl = async () => {
  let data = await fetcher.crawl(link, type);
  console.log(data[0]);
};
crawl();