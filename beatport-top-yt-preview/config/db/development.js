module.exports = {
  'username': process.env.DBCONFIG_USERNAME || 'root',
  'password': process.env.DBCONFIG_PASSWORD || 'password',
  'database': process.env.DBCONFIG_DATABASE || 'database_development',
  'host': process.env.DBCONFIG_HOST || '127.0.0.1',
  'dialect': 'mysql',
  'operatorsAliases': false
};
