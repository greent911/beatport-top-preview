'use strict';

const BeatportTopFetcher = require('beatport-top-fetcher');
let key = 'Your API key goes here';
let fetcher = new BeatportTopFetcher(key);
// let track = {
//   num: '14',
//   type: 'psy-trance',
//   title: 'Space Candy Original Mix',
//   artists: 'San Pedro',
//   remixers: '',
//   labels: 'Grasshopper Records',
//   genre: 'Psy-Trance',
//   released: '2019-04-15',
//   link: '/track/space-candy-original-mix/11765032',
//   imglink: 'https://geo-media.beatport.com/image_size/95x95/2af94ad3-a130-439a-8652-86b17270ceeb.jpg'
// };
// let track = {
//   title: 'Natya Original Mix',
//   artists: 'Fergie & Sadrian',
// };
// let track = {
//   title: 'Laniakea Kalki Remix',
//   artists: 'La P\'tite Fumee',
//   remixers: 'Kalki',
// };
let track = {
  title: 'That Don\'t Compressor Me Much Original Mix',
  artists: 'Headroom (SA)',
};

fetcher.tops.push(track);

const getVideoId = async () => {
  let data = await fetcher.fetchVideoIds();
  console.log(data);
};
getVideoId();