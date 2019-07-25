/**
 * Beatport Top 100 Tracks Fetcher
 */
const Crawler = require('crawler');
const { google } = require('googleapis');
const he = require('he');

/** Extending String type with substring removal */
String.prototype.remove = function (strs) {
  let replaceStrs = (Array.isArray(strs))? strs: [strs];
  return replaceStrs.reduce((accumulator, replaceStr) => {
    return accumulator.replace(replaceStr, '');
  }, this);
};

/** Crawl top 100 track data on beatport */
function crawl (type, srclink) {
  return new Promise((resolve, reject) => {
    let crawler = new Crawler({
      callback : function (error, res, done) {
        let top100list = [];
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
            top100list.push(track);
          });
          resolve(top100list);
        }
        done();
      }
    });
    crawler.queue(srclink);
  });
}
/** Decode HTML text */
function decodeHTML (text) {
  return he.decode(text);
}
/** Decode ASCII */
function decodeASCII (text) {
  let combining = /[\u0300-\u036F]/g; 
  return text.normalize('NFKD').replace(combining, '');
}

/** Validate youtube search result title */
class Validator {
  constructor (ytTitle) {
    this.ytTitle = ytTitle;
  }
  validateArtists (artists) {
    let checkingTitle = this.ytTitle.toLowerCase();
    let lArtists = artists.toLowerCase();
    let lArtistsStrs = lArtists.split(', ');
    let validate = lArtistsStrs.some((artist) => checkingTitle.includes(artist));
    return validate;
  }
  validateTitle (title) {
    let checkingTitle = this.ytTitle.toLowerCase();
    let lTitle = title.remove(' Remix').toLowerCase();
    let lTitleStrs = lTitle.split(' ');
    return lTitleStrs.some((str) => checkingTitle.includes(str));
  }
  validateRemixers (remixers) {
    return this.validateArtists(remixers);
  }
  validatePrimaryTitle (primaryTitle) {
    let checkingTitle = this.ytTitle.toLowerCase();
    let lTitle = primaryTitle.toLowerCase();
    return checkingTitle.includes(lTitle);
  }
}

/**
 * The BeatportTopFetcher class
 */
class BeatportTopFetcher {
  /**
   * construct with youtube API key
   * @param {string} authkey youtube API key
   */
  constructor (authkey) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: authkey,
    });
    this.top100list = [];
    this.queryTitleFilterArray = [' Original Mix'];
    this.queryArtistsFilterArray = [new RegExp('\\(.*?\\)', 'g')];
  }
  /**
   * Crawl top 100 track data
   * @param {string} type 'top100' or other genre
   * @param {string} srclink beatport top 100 page link
   */
  async fetchList (type, srclink) {
    this.top100list = await crawl(type, srclink);
    return this.top100list;
  }
  /**
   * Get the title for youtube search
   * @param {string} title track title
   * @returns {string} search title
   */
  getQueryTitle (title) {
    return title.remove(this.queryTitleFilterArray);
  }
  /**
   * Get the artists for youtube search
   * @param {string} title track artists
   * @returns {string} search artists
   */
  getQueryArtists (artists) {
    return artists.remove(this.queryArtistsFilterArray);
  }
  /**
   * Get the title & artists for youtube search
   * @param {string} track track data
   */
  getQueryInput (track) {
    let {title, artists} = track;
    return {
      queryTitle: this.getQueryTitle(title),
      queryArtists: this.getQueryArtists(artists),
    };
  }
  /** format HTML text from youtube search */
  formatText (text) {
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
  getValidVideoId (ytResponseData, track, queryTitle, queryArtists) {
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
  async getVideoId (track) {
    let {title, artists} = track;
    let queryTitle = this.getQueryTitle(title);
    let queryArtists = this.getQueryArtists(artists);
    let ytQueryPromise = () => this.youtube.search.list({
      part: 'id,snippet',
      maxResults: 1,
      type: 'video',
      videoEmbeddable: true,
      videoSyndicated: true,
      q: queryTitle + ' ' + queryArtists
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
  async getVideoIds () {
    let videoIds = await Promise.all(this.top100list.map((track) => this.getVideoId(track)));
    this.top100list.map((data, index) => {
      data['video_id'] = videoIds[index];
    });
    return videoIds;
  }
}

/** Export Class */
module.exports = BeatportTopFetcher;