/**
 * scheduler.js: job scheduler for fetching track data
 */
const schedule = require('node-schedule');
const moment = require('moment');
const { fork } = require('child_process');
const debug = require('debug')('beatport-top-yt-preview:scheduler');
const logger = require('./../logger');
const errorHandler = require('./../errorHandler');

function createFetchJob(jobString, apikey, type, srclink) {
  return schedule.scheduleJob(jobString, () => {
    logger.info(jobString);
    logger.info('Start child process ' + moment().format());
    const child = fork('fetch.js', [apikey, type, srclink], {
      silent: true,
      cwd: `${__dirname}`
    });
    child.on('error', (err) => {
      errorHandler.handleErrorMessage('ERROR: spawn failed! (' + err + ')');
    });
    child.on('exit', (code, signal) => {
      logger.info('Exit child process ' + moment().format());
      logger.info(`Exit code: ${code}`);
      if (signal) {
        logger.info(`Signal: ${signal}`);
      }
    });
    child.stderr.on('data', (data) => {
      errorHandler.handleErrorMessage('stderr: ' + data);
    });
    child.stdout.on('data', (data) => {
      debug('stdout: ' + data);
    });
  });  
}

module.exports = (configOrJobString, apikey, type, srclink) => {
  let jobs = [];
  if (!apikey && !type && !srclink) {
    Object.keys(configOrJobString).forEach((genre) => {
      let {jobString, key, link} = configOrJobString[genre];
      if (jobString && key && link) {
        logger.info(`${jobString} ${key} ${genre} ${link}`);
        jobs.push(createFetchJob(jobString, key, genre, link));
      }
    });
  } else {
    jobs.push(createFetchJob(configOrJobString, apikey, type, srclink));
  }
  return jobs;
};