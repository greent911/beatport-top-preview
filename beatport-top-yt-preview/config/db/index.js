'use strict';

const env = process.env.NODE_ENV || 'development';
/**
 * @typedef {Object} DBConfig
 * @property {string} username The database's username
 * @property {string} password The database's password
 * @property {string} database The database's name
 * @property {string} host The database's IP address or hostname
 * @property {string} dialect The dialect for Sequelize ORM
 * @property {boolean} operatorsAliases Enable Sequelize's symbol operators
 */
/**
 * DB configuration by different environment (development | test | production)
 * @type {DBConfig}
 */
module.exports = require(`./${env}`);