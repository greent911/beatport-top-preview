'use strict';

const expect = require('chai').expect;
const BeatportTopFetcher = require('beatport-top-fetcher');

describe('beatport-top-fetcher validate the track\'s Youtube video data is correct', function() {
  let fetcher = new BeatportTopFetcher();
  let dataValidator = fetcher.dataValidator;
  
  it('When the video\'s title contains the track title and artist, should return true', function() {
    let videoTitle = 'Headroom - That Don\'t Compressor Me Much';
    let track = {
      title: 'That Don\'t Compressor Me Much',
      artists: 'Headroom',
    };

    let isValid = dataValidator.validate(videoTitle, track);

    expect(isValid).to.be.true;
  });

  it('When the video\'s title does not contain the track title, should return false', function() {
    let videoTitle = 'Headroom - That Don\'t Compressor Me Much';
    let track = {
      title: 'Natya',
      artists: 'Headroom',
    };

    let isValid = dataValidator.validate(videoTitle, track);

    expect(isValid).to.be.false;
  });

  it('When the video\'s title does not contain the track title (with "Remix" string), should return false', function() {
    let videoTitle = 'Illenium - Pray (Blanke Remix) ft. Kameron Alexander';
    let track = {
      title: 'Laniakea Kalki Remix',
      artists: 'Illenium, Kameron Alexander',
    };

    let isValid = dataValidator.validate(videoTitle, track);

    expect(isValid).to.be.false;
  });

  it('When the video\'s title contains the title and multiple artists of the track, should return true', function() {
    let videoTitle = 'Illenium - Pray (Blanke Remix) ft. Kameron Alexander';
    let track = {
      title: 'Pray Blanke Remix',
      artists: 'Illenium, Kameron Alexander',
    };

    let isValid = dataValidator.validate(videoTitle, track);

    expect(isValid).to.be.true;
  });

  it('When the video\'s title does not contain the track artists, should return false', function() {
    let videoTitle = 'Illenium - Pray (Blanke Remix) ft. Kameron Alexander';
    let track = {
      title: 'Pray Blanke Remix',
      artists: 'Fake Illenium, Fake Kameron Alexander',
    };

    let isValid = dataValidator.validate(videoTitle, track);

    expect(isValid).to.be.false;
  });
});