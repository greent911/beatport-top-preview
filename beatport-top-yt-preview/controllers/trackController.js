'use strict';

const debug = require('debug')('beatport-top-yt-preview:trackController');
const { param, query, sanitizeParam, sanitizeQuery } = require('express-validator');

const requestValidationHandler = require('./../middlewares/requestValidationHandler');
const { trackService } = require('./../services');

const trackFields = ['num', 'type', 'title', 'artists', 
  'remixers', 'labels', 'genre', 'released', 'link', 
  'imglink', 'video_id', 'created_at', 'updated_at'];

/**
 * Returns the tracks
 * @type {Function[]} Request handler middlewares
 */
const getTracks = [
  /**
   * 1. VALIDATION RULES
   */
  [
    // If type exists from /:type, type must contain only letters and numbers (can be connected with dashes)
    param('type')
      .optional().isString().matches(/^[a-zA-Z0-9]+$|^[a-zA-Z0-9]+[a-zA-Z0-9-]*[a-zA-Z0-9]+$/)
      .withMessage('incorrect format'),

    // If fields exist from query string
    query('fields')
      .optional().isString().matches(/^[a-z0-9_]+$|^[a-z0-9_]+[a-z0-9_,]*[a-z0-9_]+$/)
      .withMessage('incorrect format').bail()
      .custom((str) => {
        let fields = str.split(',');
        if (!fields.every((field) => trackFields.includes(field))) {
          throw new Error('Some fields are not in track field list');
        }
        return true;
      })
  ],
  /**
   * 2. VALIDATE
   */
  requestValidationHandler,
  /**
   * 3. SANITIZE
   */
  [
    sanitizeParam('type').customSanitizer((value) => value || 'top100'),
    sanitizeQuery('fields').customSanitizer((value) => {
      return (value)? value.split(','): value;
    })
  ],
  /**
   * 4. HANDLE REQUEST
   */
  async (req, res, next) => {
    let { type } = req.params;
    let { fields } = req.query;
    debug(`fields: ${fields}`);
    try {
      let tracks = await trackService.getTracksByType(type, fields);
      return res.json(tracks);
    } catch (err) {
      return next(err);
    }
  }
];

module.exports = {
  getTracks
};