var expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher', function() {
  describe('getQueryInput', function() {
    let fetcher = new BeatportTopFetcher();
    it('normal query should be the same', function() {
      let track = {
        title: 'Pray Blanke Remix',
        artists: 'Illenium, Kameron Alexander',
      };
      let queryInput = fetcher.getQueryInput(track);
      expect(queryInput.queryTitle).to.equal(track.title);
      expect(queryInput.queryArtists).to.equal(track.artists);
    });
    it('query title should not include "Original Mix"', function() {
      let track = {
        title: 'DMT Original Mix',
        artists: 'Becker, Labirinto',
      };
      let queryInput = fetcher.getQueryInput(track);
      expect(queryInput.queryTitle).to.equal('DMT');
    });
    it('query artists should not include "(......)"', function() {
      let track = {
        title: 'Music Is The Heart Original Mix',
        artists: 'Hypnocoustics, Mandala (UK)',
      };
      let queryInput = fetcher.getQueryInput(track);
      expect(queryInput.queryArtists).to.equal('Hypnocoustics, Mandala ');
    });
  });
});