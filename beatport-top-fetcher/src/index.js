'use strict';

/**
 * Beatport Top 100 Tracks Fetcher
 */
const Crawler = require('crawler');
const { google } = require('googleapis');
const he = require('he');

/**
 * Return a new string with string(s) removal
 * @param {string|string[]} strs string(s) to be removed
 * @returns {string} new string 
 */
String.prototype.remove = function(strs) {
  let removeStrs = (Array.isArray(strs))? strs: [strs];
  return removeStrs.reduce((current, str) => {
    return current.replace(str, '');
  }, this);
};

/** Decode HTML text */
function decodeHTML(text) {
  return he.decode(text);
}
/** Decode ASCII */
function decodeASCII(text) {
  let combining = /[\u0300-\u036F]/g; 
  return text.normalize('NFKD').replace(combining, '');
}

/** 
 * Crawl Beatport webpage for top 100 tracks
 * @param {string} type The label type
 * @param {string} srclink Beatport Top 100's page link to be crawled
 * @returns {Promise<Object[]>} A promise that contains the array of tracks when fulfilled.
 **/
function crawl(type, srclink) {
  return new Promise((resolve, reject) => {
    let crawler = new Crawler({
      callback : function(error, res, done) {
        let plainTracks = [];
        if (error) {
          reject(error);
        } else {
          const $ = res.$;
          $('ul.bucket-items li.bucket-item').each(function(i, elem) {
            let meta = $(elem).find('.buk-track-meta-parent');
            let track = {
              num: $(elem).find('.buk-track-num').text(),
              type: type,
              title: meta.find('.buk-track-title a').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              primarytitle: meta.find('.buk-track-title a span.buk-track-primary-title').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              artists: meta.find('.buk-track-artists').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              remixers: meta.find('.buk-track-remixers').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              labels: meta.find('.buk-track-labels').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              genre: meta.find('.buk-track-genre').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              released: meta.find('.buk-track-released').text(),
              link: meta.find('.buk-track-title a').attr('href'),
              imglink: $(elem).find('.buk-track-artwork-parent a img.buk-track-artwork').attr('data-src')
            };
            plainTracks.push(track);
          });
          resolve(plainTracks);
        }
        done();
      }
    });
    crawler.queue(srclink);
  });
}

/** Validate youtube search result title */
class Validator {
  constructor(ytTitle) {
    this.ytTitle = ytTitle;
  }
  validateArtists(artists) {
    let checkingTitle = this.ytTitle.toLowerCase();
    let lArtists = artists.toLowerCase();
    let lArtistsStrs = lArtists.split(', ');
    let isValid = lArtistsStrs.some((artist) => checkingTitle.includes(artist));
    return isValid;
  }
  validateTitle(title) {
    let checkingTitle = this.ytTitle.toLowerCase();
    let lTitle = title.remove(' Remix').toLowerCase();
    let lTitleStrs = lTitle.split(' ');
    let isValid = lTitleStrs.some((str) => checkingTitle.includes(str));
    return isValid;
  }
  validateRemixers(remixers) {
    let isValid = this.validateArtists(remixers);
    return isValid;
  }
  validatePrimaryTitle(primaryTitle) {
    let checkingTitle = this.ytTitle.toLowerCase();
    let lTitle = primaryTitle.toLowerCase();
    let isValid = checkingTitle.includes(lTitle);
    return isValid;
  }
}

/**
 * The BeatportTopFetcher class
 */
class BeatportTopFetcher {
  /**
   * Construct with Youtube API key
   * @param {string} key Youtube API key
   */
  constructor(key) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: key,
    });
    this.tops = [];
    this.titleFilterKeywords = [' Original Mix'];
    this.artistsFilterKeywords = [new RegExp('\\(.*?\\)', 'g')];
  }
  /**
   * Crawl Beatport webpage for top 100 tracks
   * @param {string} type The label type
   * @param {string} link Beatport Top 100's page link to be crawled
   * @returns {Promise<Object[]>} A promise that contains the array of tracks when fulfilled.
   */
  async crawl(type, link) {
    this.tops = await crawl(type, link);
    return this.tops;
  }
  /**
   * Get the title for youtube search
   * @param {string} title track title
   * @returns {string} search title
   */
  getQueryTitle(title) {
    return title.remove(this.titleFilterKeywords);
  }
  /**
   * Get the artists for youtube search
   * @param {string} title track artists
   * @returns {string} search artists
   */
  getQueryArtists(artists) {
    return artists.remove(this.artistsFilterKeywords);
  }
  /**
   * Get the title & artists for youtube search
   * @param {Object} track track data
   * @param {string} track.title
   * @param {string} track.artists
   */
  getQueryInput({ title, artists }) {
    return {
      queryTitle: this.getQueryTitle(title),
      queryArtists: this.getQueryArtists(artists),
    };
  }
  /** format HTML text from youtube search */
  formatText(text) {
    return decodeASCII(decodeHTML(text));
  }
  /**
   * Validate video ID data from youtube search API
   * @param {object} ytResponseData youtube search response
   * @param {object} track track data
   * @param {string} queryTitle the title for youtube search
   * @param {*} queryArtists the artists for youtube search
   * @returns {string|null} if is valid or not, return video ID or null
   */
  getValidVideoId(ytResponseData, track, queryTitle, queryArtists) {
    if (!ytResponseData) {
      return null;
    }
    let qTitle = queryTitle || this.getQueryTitle(track.title);
    let qArtists = queryArtists || this.getQueryArtists(track.artists);
    let {snippet, id} = ytResponseData.items[0];
    let ytTitle = (snippet)? snippet.title: undefined;
    let videoId = (id)? id.videoId: undefined;
    ytTitle = this.formatText(ytTitle);
    let validator = new Validator(ytTitle);
    if (!validator.validateArtists(qArtists))
      return null;
    if (!validator.validateTitle(qTitle))
      return null;
    if (track.remixers && !validator.validateRemixers(this.getQueryArtists(track.remixers)))
      return null;
    // if (track.primarytitle && !validator.validatePrimaryTitle(track.primarytitle))
    //   return null;
    return videoId;
  }
  /**
   * Get video ID by youtube search API
   * @param {object} track track data
   */
  async getVideoId(track) {
    let {title, artists} = track;
    let queryTitle = this.getQueryTitle(title);
    let queryArtists = this.getQueryArtists(artists);
    let ytQueryPromise = () => this.youtube.search.list({
      part: 'id,snippet',
      maxResults: 1,
      type: 'video',
      videoEmbeddable: true,
      videoSyndicated: true,
      q: `${queryTitle} ${queryArtists}`
    });
    let response = await ytQueryPromise();
    if (response && response.data && response.data.items && response.data.items.length > 0) {
      return this.getValidVideoId(response.data, track, queryTitle, queryArtists);
    } else {
      return null;
    }
  }
  /**
   * Get top 100 track video IDs
   */
  async getVideoIds() {
    let videoIds = await Promise.all(this.tops.map((track) => this.getVideoId(track)));
    this.tops.map((data, index) => {
      data['video_id'] = videoIds[index];
    });
    return videoIds;
  }
}

/** Export Class */
module.exports = BeatportTopFetcher;