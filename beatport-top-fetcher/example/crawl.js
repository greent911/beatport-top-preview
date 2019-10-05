'use strict';

const BeatportTopFetcher = require('beatport-top-fetcher');
let fetcher = new BeatportTopFetcher();
let pagelink = 'https://www.beatport.com/genre/bass-house/91/top-100';
const crawl = async () => {
  let data = await fetcher.crawl(pagelink);
  console.log(data[0]);
};
crawl();