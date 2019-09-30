'use strict';

const expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher sanitize query input(track title & artists from Bearport) for Youtube search', function() {
  describe('Initialize fetcher without google API key:', function() {
    let fetcher = new BeatportTopFetcher();
    let querySanitizer = fetcher.querySanitizer;
    it('When there are normal track title and artists, query input should be the same', function() {
      let track = {
        title: 'Pray Blanke Remix',
        artists: 'Illenium, Kameron Alexander',
      };

      let queryTitle = querySanitizer.sanitize('title', track.title);
      let queryArtists = querySanitizer.sanitize('artists', track.artists);

      expect(queryTitle).to.equal(track.title);
      expect(queryArtists).to.equal(track.artists);
    });
    it('When track title includes "Original Mix", query title should not include', function() {
      let track = {
        title: 'DMT Original Mix',
      };

      let queryTitle = querySanitizer.sanitize('title', track.title);
      
      expect(queryTitle).to.not.equal(track.title);
      expect(queryTitle).to.equal('DMT');
    });
    it('When track artists includes "(...)", query artists should not include', function() {
      let track = {
        artists: 'Hypnocoustics, Mandala (UK)',
      };

      let queryArtists = querySanitizer.sanitize('artists', track.artists);
      
      expect(queryArtists).to.not.equal(track.artists);
      expect(queryArtists).to.equal('Hypnocoustics, Mandala ');
    });
    it('When track artists includes multiple "(...)"s, query artists should not include', function() {
      let track = {
        artists: 'Hypnocoustics (XX123xaXX), Mandala (UK)',
      };

      let queryArtists = querySanitizer.sanitize('artists', track.artists);
      
      expect(queryArtists).to.not.equal(track.artists);
      expect(queryArtists).to.equal('Hypnocoustics , Mandala ');
    });
  });
});