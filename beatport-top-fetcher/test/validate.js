'use strict';

const expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher check the video data is valid for the track data', function() {
  let fetcher = new BeatportTopFetcher();
  let youtubeDataValidator = fetcher.youtubeDataValidator;
  it('When there are single title and artists, should validate correctly', function() {
    let videoTitle = 'Fergie & Sadrian - Natya (Original Mix)';
    let truth = {
      title: 'Natya',
      artists: 'Fergie & Sadrian',
    };

    let isValid = youtubeDataValidator.validate(videoTitle, truth);

    expect(isValid).to.be.true;
  });
  it('When track contains Remix string, should validate correctly', function() {
    let videoTitle = 'Illenium - Pray (Blanke Remix) ft. Kameron Alexander';
    let truth = {
      title: 'Pray Blanke Remix',
      artists: 'Illenium, Kameron Alexander',
    };

    let isValid = youtubeDataValidator.validate(videoTitle, truth);

    expect(isValid).to.be.true;
  });
});