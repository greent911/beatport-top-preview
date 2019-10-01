'use strict';

const expect = require('chai').expect;
const BeatportTopFetcher = require('beatport-top-fetcher');

describe('beatport-top-fetcher sanitize queries (from track title & artists) for Youtube search', function() {
  const fetcher = new BeatportTopFetcher();
  const querySanitizer = fetcher.querySanitizer;

  it('When there is a normal case, queries should remain the same', function() {
    let track = {
      title: 'Pray Blanke Remix',
      artists: 'Illenium, Kameron Alexander',
    };

    let queryTitle = querySanitizer.sanitize('title', track.title);
    let queryArtists = querySanitizer.sanitize('artists', track.artists);

    expect(queryTitle).to.equal(track.title);
    expect(queryArtists).to.equal(track.artists);
  });

  it('When track title includes "Original Mix", queries should not include it', function() {
    let track = {
      title: 'DMT Original Mix',
    };

    let queryTitle = querySanitizer.sanitize('title', track.title);
    
    expect(queryTitle).to.not.equal(track.title);
    expect(queryTitle).to.equal('DMT');
  });

  it('When track artists include "(...)", queries should not include it', function() {
    let track = {
      artists: 'Hypnocoustics, Mandala (UK)',
    };

    let queryArtists = querySanitizer.sanitize('artists', track.artists);
    
    expect(queryArtists).to.not.equal(track.artists);
    expect(queryArtists).to.equal('Hypnocoustics, Mandala ');
  });
  
  it('When track artists include multiple "(...)"s, queries should not include them', function() {
    let track = {
      artists: 'Hypnocoustics (XX123xaXX), Mandala (UK)',
    };

    let queryArtists = querySanitizer.sanitize('artists', track.artists);
    
    expect(queryArtists).to.not.equal(track.artists);
    expect(queryArtists).to.equal('Hypnocoustics , Mandala ');
  });
});