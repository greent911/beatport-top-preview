'use strict';

module.exports = {
  'username': process.env.DBCONFIG_USERNAME,
  'password': process.env.DBCONFIG_PASSWORD,
  'database': process.env.DBCONFIG_DATABASE,
  'host': process.env.DBCONFIG_HOST,
  'dialect': 'mysql',
  'operatorsAliases': false
};
