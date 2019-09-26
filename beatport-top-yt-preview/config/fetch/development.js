'use strict';

module.exports = {
  'top100': {
    'cronTime': process.env.GENRE_TOP100_CRONSTR || '0 0 0 * * *',
    'key': process.env.GENRE_TOP100_KEY
  },
  'afro-house': {
    'cronTime': process.env.GENRE_AFROHOUSE_CRONSTR,
    'key': process.env.GENRE_AFROHOUSE_KEY
  },
  'bass-house': {
    'cronTime': process.env.GENRE_BASSHOUSE_CRONSTR,
    'key': process.env.GENRE_BASSHOUSE_KEY
  },
  'big-room': {
    'cronTime': process.env.GENRE_BIGROOM_CRONSTR,
    'key': process.env.GENRE_BIGROOM_KEY
  },
  'deep-house': {
    'cronTime': process.env.GENRE_DEEPHOUSE_CRONSTR,
    'key': process.env.GENRE_DEEPHOUSE_KEY
  },
  'drum-and-bass': {
    'cronTime': process.env.GENRE_DRUMBASS_CRONSTR,
    'key': process.env.GENRE_DRUMBASS_KEY
  },
  'dubstep': {
    'cronTime': process.env.GENRE_DUBSTEP_CRONSTR,
    'key': process.env.GENRE_DUBSTEP_KEY
  },
  'electro-house': {
    'cronTime': process.env.GENRE_ELECTROHOUSE_CRONSTR,
    'key': process.env.GENRE_ELECTROHOUSE_KEY
  },
  'electronica-downtempo': {
    'cronTime': process.env.GENRE_DOWNTEMPO_CRONSTR,
    'key': process.env.GENRE_DOWNTEMPO_KEY
  },
  'future-house': {
    'cronTime': process.env.GENRE_FUTURE_CRONSTR,
    'key': process.env.GENRE_FUTURE_KEY
  },
  'hard-dance': {
    'cronTime': process.env.GENRE_HARDDANCE_CRONSTR,
    'key': process.env.GENRE_HARDDANCE_KEY
  },
  'hardcore-hard-techno': {
    'cronTime': process.env.GENRE_HARDCORE_CRONSTR,
    'key': process.env.GENRE_HARDCORE_KEY
  },
  'house': {
    'cronTime': process.env.GENRE_HOUSE_CRONSTR,
    'key': process.env.GENRE_HOUSE_KEY
  },
  'melodic-house-and-techno': {
    'cronTime': process.env.GENRE_MELODICTECH_CRONSTR,
    'key': process.env.GENRE_MELODICTECH_KEY
  },
  'progressive-house': {
    'cronTime': process.env.GENRE_PROG_CRONSTR,
    'key': process.env.GENRE_PROG_KEY
  },
  'psy-trance': {
    'cronTime': process.env.GENRE_PSYTRANCE_CRONSTR,
    'key': process.env.GENRE_PSYTRANCE_KEY
  },
  'tech-house': {
    'cronTime': process.env.GENRE_TECHHOUSE_CRONSTR,
    'key': process.env.GENRE_TECHHOUSE_KEY
  },
  'techno': {
    'cronTime': process.env.GENRE_TECHNO_CRONSTR,
    'key': process.env.GENRE_TECHNO_KEY
  },
  'trance': {
    'cronTime': process.env.GENRE_TRANCE_CRONSTR,
    'key': process.env.GENRE_TRANCE_KEY
  },
  'trap-future-bass': {
    'cronTime': process.env.GENRE_TRAPFUTURE_CRONSTR,
    'key': process.env.GENRE_TRAPFUTURE_KEY
  }
};
