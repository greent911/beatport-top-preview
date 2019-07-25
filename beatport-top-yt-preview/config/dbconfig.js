module.exports = {
  'development': {
    'username': 'root',
    'password': 'password',
    'database': 'database_development',
    'host': '127.0.0.1',
    'dialect': 'mysql'
  },
  'test': {
    'username': process.env.DBCONFIG_USERNAME,
    'password': process.env.DBCONFIG_PASSWORD,
    'database': process.env.DBCONFIG_DATABASE,
    'host': process.env.DBCONFIG_HOST,
    'dialect': 'mysql'
  },
  'production': {
    'username': process.env.DBCONFIG_USERNAME,
    'password': process.env.DBCONFIG_PASSWORD,
    'database': process.env.DBCONFIG_DATABASE,
    'host': process.env.DBCONFIG_HOST,
    'dialect': 'mysql'
  }
};
