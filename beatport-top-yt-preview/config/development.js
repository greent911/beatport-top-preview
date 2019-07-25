var config = {
  'env':  'development',
  'top100': {
    'jobString': process.env.GENRE_TOP100_CRONSTR,
    'key': process.env.GENRE_TOP100_KEY
  },
  'big-room': {
    'jobString': process.env.GENRE_BIGROOM_CRONSTR,
    'key': process.env.GENRE_BIGROOM_KEY
  },
  'dubstep': {
    'jobString': process.env.GENRE_DUBSTEP_CRONSTR,
    'key': process.env.GENRE_DUBSTEP_KEY
  },
  'future-house': {
    'jobString': process.env.GENRE_FUTURE_CRONSTR,
    'key': process.env.GENRE_FUTURE_KEY
  },
  'house': {
    'jobString': process.env.GENRE_HOUSE_CRONSTR,
    'key': process.env.GENRE_HOUSE_KEY
  },
  'progressive-house': {
    'jobString': process.env.GENRE_PROG_CRONSTR,
    'key': process.env.GENRE_PROG_KEY
  },
  'psy-trance': {
    'jobString': process.env.GENRE_PSYTRANCE_CRONSTR,
    'key': process.env.GENRE_PSYTRANCE_KEY
  },
  'tech-house': {
    'jobString': process.env.GENRE_TECHHOUSE_CRONSTR,
    'key': process.env.GENRE_TECHHOUSE_KEY
  },
  'techno': {
    'jobString': process.env.GENRE_TECHNO_CRONSTR,
    'key': process.env.GENRE_TECHNO_KEY
  },
  'trance': {
    'jobString': process.env.GENRE_TRANCE_CRONSTR,
    'key': process.env.GENRE_TRANCE_KEY
  },
};

module.exports = config;
