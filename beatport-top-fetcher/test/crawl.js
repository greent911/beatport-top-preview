'use strict';

const expect = require('chai').expect;
const BeatportTopFetcher = require('beatporttopfetcher');

describe('beatport-top-fetcher crawls Beatport Top 100', function() {
  describe('Initialize fetcher without google API key:', function() {
    this.timeout(15000);
    let fetcher = new BeatportTopFetcher();
    it('datalist should be 0 length', function() {
      expect(fetcher.tops).to.have.lengthOf(0);
    });
    it('datalist should be an empty array', function() {
      expect(fetcher.tops).to.be.an('array').that.is.empty;
    });
    it('datalist should be 100 length after crawled', async function() {
      let link = 'https://www.beatport.com/top-100';
      let type = 'top100';

      let datalist = await fetcher.crawl(link, type);

      expect(datalist).to.have.lengthOf(100);
      expect(fetcher.tops).to.have.lengthOf(100);
    });
  });
});