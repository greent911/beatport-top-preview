'use strict';

/**
 * scheduler.js: job scheduler for fetching tracks
 */
const { fork } = require('child_process');
const debug = require('debug')('beatport-top-yt-preview:scheduler');
const moment = require('moment');
const schedule = require('node-schedule');
const logger = require('./../utils/logger');

/**
 * @param {string} cronTime The Cron time format define frequency of crawling actions
 * @param {*} key The Youtube API key to fetch data on Youtube
 * @param {*} genre The genre
 * @param {*} link The genre's page link to be crawled
 */
const createFetchingJob = (cronTime, key, genre, link) => {
  logger.info(`Scheduling job with cron format: ${cronTime}`);
  logger.info(`Creating the cron job to fetch '${genre}' tracks from ${link} with Youtube API key: ${key}`);
  return schedule.scheduleJob(cronTime, () => {
    logger.info(cronTime);
    logger.info('Start child process ' + moment().format());
    const child = fork('fetch.js', [key, genre, link], {
      silent: true,
      cwd: `${__dirname}`
    });
    child.on('error', (err) => {
      logger.error('ERROR: spawn failed! (' + err + ')');
    });
    child.on('exit', (code, signal) => {
      logger.info('Exit child process ' + moment().format());
      logger.info(`Exit code: ${code}`);
      if (signal) {
        logger.info(`Signal: ${signal}`);
      }
    });
    child.stderr.on('data', (data) => {
      logger.error('stderr: ' + data);
    });
    child.stdout.on('data', (data) => {
      debug('stdout: ' + data);
    });
  });  
};

/**
 * @typedef {Object} GenreConfig
 * @property {string} cronTime 
 * @property {string} key 
 * @property {string} link
 */
/**
 * @param {GenreConfig} config 
 */
const setupFetchingJobs = (config) => {
  let jobs = [];
  Object.keys(config).forEach((genre) => {
    let {cronTime, key, link} = config[genre];
    if (cronTime && key && link) {
      jobs.push(createFetchingJob(cronTime, key, genre, link));
    }
  });
  return jobs;
};

module.exports = {
  setupFetchingJobs,
  createFetchingJob
};