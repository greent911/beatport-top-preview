var expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher sanitizes query input(track title & artists from Bearport) for Youtube search API', function() {
  describe('Test the getQueryInput(track) method:', function() {
    let fetcher = new BeatportTopFetcher();
    it('When there are normal track title and artists, query input should be the same', function() {
      let track = {
        title: 'Pray Blanke Remix',
        artists: 'Illenium, Kameron Alexander',
      };

      let queryInput = fetcher.getQueryInput(track);
      
      expect(queryInput.queryTitle).to.equal(track.title);
      expect(queryInput.queryArtists).to.equal(track.artists);
    });
    it('When track title includes "Original Mix", query title should not include', function() {
      let track = {
        title: 'DMT Original Mix',
        artists: 'Becker, Labirinto',
      };

      let queryInput = fetcher.getQueryInput(track);
      
      expect(queryInput.queryTitle).to.equal('DMT');
    });
    it('When track artists includes "(...)", query artists should not include', function() {
      let track = {
        title: 'Music Is The Heart Original Mix',
        artists: 'Hypnocoustics, Mandala (UK)',
      };

      let queryInput = fetcher.getQueryInput(track);
      
      expect(queryInput.queryArtists).to.equal('Hypnocoustics, Mandala ');
    });
  });
});