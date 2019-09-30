'use strict';

/**
 * Beatport Top 100 Tracks Fetcher
 */
const Crawler = require('crawler');
const { google } = require('googleapis');
const he = require('he');

/**
 * Return a new string in which specified words from the current string are deleted 
 * @param {string|string[]} filters words or filter rules to be removed
 * @returns {string} new string 
 */
String.prototype.remove = function(filters) {
  let removeFilters = (Array.isArray(filters))? filters: [filters];
  return removeFilters.reduce((current, filter) => {
    return current.replace(filter, '');
  }, this);
};

/** Decode HTML text */
const decodeHTML = (text) => {
  return he.decode(text);
};
/** Decode ASCII */
const decodeASCII = (text) => {
  let combining = /[\u0300-\u036F]/g; 
  return text.normalize('NFKD').replace(combining, '');
};
const formatText = (text) => {
  return decodeASCII(decodeHTML(text));
};

/** 
 * Crawl Beatport webpage for top 100 tracks
 * @param {string} pagelink Beatport Top 100's page link to be crawled
 * @param {string} type The label type
 * @returns {Promise<Object[]>} A promise that contains the array of tracks when fulfilled.
 **/
const crawl = (pagelink, type) => {
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
    crawler.queue(pagelink);
  });
};

class Sanitizer {
  constructor(rules) {
    this.filterMap = new Map();
    rules.forEach(({name, filters}) => {
      this.setFilters(name, filters);
    });
  }

  setFilters(name, filters) {
    this.filterMap.set(name, filters);
  }

  sanitize(name, str) {
    let filters = this.filterMap.get(name);
    return str.remove(filters);
  }
}

const validations = {
  containArtists(videoTitle, artists) {
    let checking = videoTitle.toLowerCase();
    let searchs = artists.toLowerCase().split(', ');
    let isValid = searchs.some((artist) => checking.includes(artist));
    return isValid;
  },
  containTitle(videoTitle, title) {
    let checking = videoTitle.toLowerCase();
    let searchs = title.remove(' Remix').toLowerCase().split(' ');
    let isValid = searchs.some((str) => checking.includes(str));
    return isValid;
  }
};

/** Validate youtube search result title */
class Validator {
  constructor() {
    this.validatorMap = new Map();
  }

  add(key, validation, nullable=false) {
    this.validatorMap.set(key, {
      validation,
      nullable,
    });
  }

  validate(videoTitle, truth) {
    for (const [ key, validator ] of this.validatorMap) {
      const { validation, nullable } = validator;
      if (nullable) {
        if (truth[key] && !validation(videoTitle, truth[key])) {
          return false;
        }
      } else {
        if (!validation(videoTitle, truth[key])) {
          return false;
        }
      }
    }
    return true;
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
    this.youtubeAPI = google.youtube({
      version: 'v3',
      auth: key,
    });
    this.tops = [];
    this.querySanitizer = new Sanitizer([
      { 
        name: 'title',
        filters: [' Original Mix'] 
      },
      { 
        name: 'artists', 
        filters: [new RegExp('\\(.*?\\)', 'g')] 
      }
    ]);

    this.youtubeDataValidator = new Validator();
    this.youtubeDataValidator.add('artists', validations.containArtists);
    this.youtubeDataValidator.add('title', validations.containTitle);
    this.youtubeDataValidator.add('remixers', validations.containArtists, true);
  }
  extractVideoData(responseData) {
    if (
      !responseData || typeof responseData !== 'object'
      || !Array.isArray(responseData.items) || responseData.items.length <= 0
    ) {
      return {};
    }
    let responseDataItems = responseData.items;
    let maxResults = 1;
    let videoTitle = null;
    let videoId = null;
    for (let index = 0; index < maxResults; index++) {
      const { snippet, id } = responseDataItems[index];
      videoTitle = (snippet)? snippet.title: null;
      videoId = (id)? id.videoId: null;
      if (videoId) break;
    }

    if (videoTitle) {
      videoTitle = formatText(videoTitle);
    }

    return {
      videoTitle,
      videoId,
    };
  }
  /**
   * Fetch video ID by querying Youtube search API
   * @param {object} track The track data
   */
  async fetchVideoId(track) {
    let { title, artists } = track;
    let queryTitle = this.querySanitizer.sanitize('title', title);
    let queryArtists = this.querySanitizer.sanitize('artists', artists);
    let query = `${queryTitle} ${queryArtists}`;
    let searchYoutubePromise = () => this.youtubeAPI.search.list({
      part: 'id,snippet',
      maxResults: 1,
      type: 'video',
      videoEmbeddable: true,
      videoSyndicated: true,
      q: query
    });
    let response = await searchYoutubePromise();
    if (
      !response || typeof response !== 'object' 
      || !response.data || typeof response.data !== 'object'
    ) {
      return null;
    }
    let { videoTitle, videoId } = this.extractVideoData(response.data);
    if (!videoTitle || !videoId) {
      return null;
    }
    let truth = {
      artists: queryArtists,
      title: queryTitle,
      remixers: track.remixers,
    };
    if (!this.youtubeDataValidator.validate(videoTitle, truth)) {
      return null;
    }
    return videoId;
  }
  /**
   * Crawl Beatport webpage for top 100 tracks
   * @param {string} link Beatport Top 100's page link to be crawled
   * @param {string} type The label type
   * @returns {Promise<Object[]>} A promise that contains the array of tracks when fulfilled.
   */
  async crawl(link, type='top100') {
    this.tops = await crawl(link, type);
    return this.tops.map((track) => ({...track}));
  }
  /**
   * Fetch top 100 track video IDs from Youtube
   * @returns {Promise<string[]>} A promise that contains the array of video IDs when fulfilled.
   */
  async fetchVideoIds() {
    if (this.tops.length <= 0) {
      return [];
    }
    let videoIds = await Promise.all(this.tops.map((track) => this.fetchVideoId(track)));
    this.tops.forEach((data, index) => {
      data['video_id'] = videoIds[index];
    });
    return videoIds;
  }
  /**
   * Fetch top 100 tracks
   * @param {string} link Beatport Top 100's page link to be crawled
   * @param {string} type The label type
   * @returns {Promise<Object[]>} A promise that contains the array of tracks with video IDs when fulfilled.
   */
  async fetchTracks(link, type='top100') {
    await this.crawl(link, type);
    await this.fetchVideoIds();
    return this.tops.map((track) => ({...track}));
  }
}

/** Export Class */
module.exports = BeatportTopFetcher;