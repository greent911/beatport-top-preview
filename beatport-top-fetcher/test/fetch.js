'use strict';

const expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher fetches top 100 track data from Beatport', function() {
  describe('Initialize fetcher without google API key:', function() {
    this.timeout(15000);
    let fetcher = new BeatportTopFetcher();
    it('datalist should be 0 length', function() {
      expect(fetcher.top100list).to.have.lengthOf(0);
    });
    it('datalist should be an empty array', function() {
      expect(fetcher.top100list).to.be.an('array').that.is.empty;
    });
    it('datalist should be 100 length after fetch completed', async function() {
      let type = 'top100';
      let srclink = 'https://www.beatport.com/top-100';

      let datalist = await fetcher.crawl(type, srclink);

      expect(datalist).to.have.lengthOf(100);
    });
  });
});