let key = '';
const BeatportTopFetcher = require('beatporttopfetcher');
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
// let track1 = {
//   title: 'Natya Original Mix',
//   artists: 'Fergie & Sadrian',
// };
// let track2 = {
//   title: 'Laniakea Kalki Remix',
//   artists: 'La P\'tite Fumee',
//   remixers: 'Kalki',
// };
let track3 = {
  title: 'That Don\'t Compressor Me Much Original Mix',
  artists: 'Headroom (SA)',
};
// fetcher.top100list.push(trackno);
// fetcher.top100list.push(track1);
// fetcher.top100list.push(track2);
fetcher.top100list.push(track3);

async function getVideoId() {
  let data = await fetcher.getVideoIds();
  console.log(data);
}
getVideoId();