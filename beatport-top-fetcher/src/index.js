'use strict';

/**
 * Beatport Top 100 Tracks Fetcher
 */
const Crawler = require('crawler');
const { google } = require('googleapis');
const he = require('he');

/**
 * UTILS
 */
/**
 * Return a new string in which specified words from the current string are deleted 
 * @param {string|string[]|RegExp|RegExp[]} filters The words to be removed or filter rules
 * @returns {string} The new string 
 */
String.prototype.remove = function(filters) {
  let removeFilters = (Array.isArray(filters))? filters: [filters];
  return removeFilters.reduce((current, filter) => {
    return current.replace(filter, '');
  }, this);
};

// Decode HTML text
const decodeHTML = (text) => {
  return he.decode(text);
};

// Decode ASCII text
// ref: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const decodeASCII = (text) => {
  let combining = /[\u0300-\u036F]/g; 
  return text.normalize('NFKD').replace(combining, '');
};

// Decode text
const formatText = (text) => {
  return decodeASCII(decodeHTML(text));
};

/** 
 * Crawl Beatport webpage for top 100 tracks
 * @param {string} pagelink Beatport Top 100's page link to be crawled
 * @param {string[]} [fields] The fields can be specified (All fields are included by default)
 * @returns {Promise<Object[]>} A promise that contains the array of tracks when fulfilled.
 **/
const crawl = (pagelink, fields) => {
  fields = (Array.isArray(fields))? fields: ['num', 'title', 'artists', 'remixers', 'labels', 'genre', 'released', 'link', 'imglink'];

  return new Promise((resolve, reject) => {
    let crawler = new Crawler({
      callback : function(err, res, done) {
        let tracks = [];
        if (err) {
          reject(err);
        } else {
          const $ = res.$;
          $('ul.bucket-items li.bucket-item').each(function(i, elem) {
            let meta = $(elem).find('.buk-track-meta-parent');
            let plainTrack = {
              num: $(elem).find('.buk-track-num').text(),
              title: meta.find('.buk-track-title a').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              artists: meta.find('.buk-track-artists').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              remixers: meta.find('.buk-track-remixers').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              labels: meta.find('.buk-track-labels').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              genre: meta.find('.buk-track-genre').text().replace(/\n/g, '').replace(/ +/g, ' ').trim(),
              released: meta.find('.buk-track-released').text(),
              link: meta.find('.buk-track-title a').attr('href'),
              imglink: $(elem).find('.buk-track-artwork-parent a img.buk-track-artwork').attr('data-src')
            };

            tracks.push(fields.reduce((track, field) => {
              track[field] = plainTrack[field];
              return track;
            }, {}));
          });
          resolve(tracks);
        }
        done();
      }
    });
    crawler.queue(pagelink);
  });
};

/**
 * Sanitizer for Youtube queries
 */
class QuerySanitizer {
  /**
   * The sanitizing rule
   * @typedef {Object} Rule
   * @property {string} name The rule name
   * @property {string[]|RegExp[]} filters The filter rules
   */
  /**
   * Construct with sanitizing rules
   * @param {Rule[]} rules 
   */
  constructor(rules) {
    this.ruleMap = new Map();
    rules.forEach(({name, filters}) => {
      this.setFilters(name, filters);
    });
  }

  // Set a name rule
  setFilters(name, filters) {
    this.ruleMap.set(name, filters);
  }

  /**
   * Return a new string after sanitizing
   * @param {string} name The rule name
   * @param {string} str The original string
   */
  sanitize(name, str) {
    let filters = this.ruleMap.get(name);
    return str.remove(filters);
  }
}

// Validation rules
const validations = {
  // Check videoTitle contains at least one artist
  containAtLeastOneArtist(videoTitle, artists) {
    let checking = videoTitle.toLowerCase();
    let searchs = artists.toLowerCase().split(', ');
    let isValid = searchs.some((artist) => checking.includes(artist));
    return isValid;
  },

  validateTitle(videoTitle, title) {
    let checking = videoTitle.toLowerCase();
    let searchs = title.remove(' Remix').toLowerCase().split(' ');
    let isValid = searchs.some((str) => checking.includes(str));
    return isValid;
  }
};

/**
 * Validator for Youtube search result video title
 */
class DataValidator {
  constructor() {
    this.validatorMap = new Map();
  }

  /**
   * Add a validation rule
   * @param {string} field The object field be used to validate
   * @param {Function} validation The validation rule
   * @param {boolean} nullable If is true, will not validate when the field's value is null
   */
  add(field, validation, nullable=false) {
    this.validatorMap.set(field, {
      validation,
      nullable,
    });
  }

  /**
   * Validate the video title
   * @param {string} videoTitle The video title to be validated
   * @param {Object} trackInfo The track information with fields for validation
   */
  validate(videoTitle, trackInfo) {
    for (const [ field, validator ] of this.validatorMap) {
      const { validation, nullable } = validator;
      if (nullable) {
        if (trackInfo[field] && !validation(videoTitle, trackInfo[field])) {
          return false;
        }
      } else {
        if (!validation(videoTitle, trackInfo[field])) {
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
   * @param {string} key Youtube API key
   */
  constructor(key) {
    // Initialize top 100 tracks array
    this.tops = [];

    // Set up Youtube API
    this.youtubeAPI = google.youtube({
      version: 'v3',
      auth: key,
    });

    // Set up rules to sanitize Youtube queries
    this.querySanitizer = new QuerySanitizer([
      { 
        name: 'title',
        filters: [' Original Mix'] 
      },
      { 
        name: 'artists', 
        filters: [new RegExp('\\(.*?\\)', 'g')] 
      }
    ]);

    // Set up rules by track fields to validate Youtube video data
    this.dataValidator = new DataValidator();
    this.dataValidator.add('title', validations.validateTitle);
    this.dataValidator.add('artists', validations.containAtLeastOneArtist);
    this.dataValidator.add('remixers', validations.containAtLeastOneArtist, true);
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

    // Sanitize queries
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

    // Start searching via Youtube API
    let response = await searchYoutubePromise();

    if (
      !response || typeof response !== 'object' 
      || !response.data || typeof response.data !== 'object'
    ) {
      return null;
    }

    // Extract Youtube video title and id
    let { videoTitle, videoId } = this.extractVideoData(response.data);
    if (!videoId || !videoTitle) {
      return null;
    }

    // Validate video title with track information
    let trackInfo = {
      artists: queryArtists,
      title: queryTitle,
      remixers: track.remixers,
    };
    if (!this.dataValidator.validate(videoTitle, trackInfo)) {
      return null;
    }

    return videoId;
  }

  /**
   * Crawl Beatport webpage for top 100 tracks
   * @param {string} pagelink Beatport Top 100's page link to be crawled
   * @param {string[]} [fields] The fields can be specified for the tracks
   * @returns {Promise<Object[]>} A promise that contains the array of tracks when fulfilled.
   */
  async crawl(pagelink, fields) {
    this.tops = await crawl(pagelink, fields);
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
    this.tops.forEach((track, index) => {
      track['video_id'] = videoIds[index];
    });
    return videoIds;
  }
  
  /**
   * The track data fields
   * @typedef {Object} Track
   * @property {number} [num] The track's top rank number
   * @property {string} [title] The track's title
   * @property {string} [artists] The track's artist(s)
   * @property {string} [remixers] The track's remixer(s)
   * @property {string} [labels] The track's label(s)
   * @property {string} [genre] The track's genre
   * @property {string} [released] The track's released Date, YYYY-MM-DD
   * @property {string} [link] The track's page relative link on Beatport
   * @property {string} [imglink] The track's album artwork image link
   * @property {string} [video_id] The track's Youtube video ID
   */
  /**
   * Fetch top 100 tracks
   * @param {string} pagelink Beatport Top 100's page link to be crawled
   * @param {string[]} [fields] The fields can be specified (All fields are included by default)
   * @returns {Promise<Track[]>} A promise that contains the array of tracks with video IDs when fulfilled.
   */
  async fetchTracks(pagelink, fields) {
    await this.crawl(pagelink, fields);
    if (!Array.isArray(fields) || fields.includes('video_id')) {
      await this.fetchVideoIds();
    }
    return this.tops.map((track) => ({...track}));
  }
}

module.exports = BeatportTopFetcher;