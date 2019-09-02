const merge = require('deepmerge');
const defaults = require('./default.json');
const env = process.env.NODE_ENV || 'development';
let config = require(`./${env}`);

module.exports = merge.all([defaults, config]);
