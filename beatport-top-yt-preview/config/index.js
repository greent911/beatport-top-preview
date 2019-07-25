var merge = require('deepmerge');
const defaults = require('./default.json');
require('dotenv').config();
var env = process.env.NODE_ENV || 'development';
var config = require(`./${env}`);

module.exports = merge.all([defaults, config]);
