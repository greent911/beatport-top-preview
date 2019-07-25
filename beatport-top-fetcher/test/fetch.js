var expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher', function() {
  describe('init without key', function() {
    this.timeout(15000);
    let fetcher = new BeatportTopFetcher();
    it('list should be 0 length', function() {
      expect(fetcher.top100list).to.have.lengthOf(0);
    });
    it('list should be an empty array', function() {
      expect(fetcher.top100list).to.be.an('array').that.is.empty;
    });
    it('list should be 100 length after fetching', async function() {
      let type = 'top100';
      let srclink = 'https://www.beatport.com/top-100';
      let data = await fetcher.fetchList(type, srclink);
      expect(data).to.have.lengthOf(100);
    });
  });
});