'use strict';

/**
 * The job scheduler for fetching tracks
 */
const { fork } = require('child_process');
const debug = require('debug')('beatport-top-yt-preview:fetchScheduler');
const moment = require('moment');
const schedule = require('node-schedule');
const logger = require('../utils/logger');

/**
 * @param {Object} settings
 * @param {string} settings.cronTime The Cron time format define frequency of actions
 * @param {*} settings.key The Youtube Data API key to fetch data on Youtube
 * @param {*} settings.pagelink Beatport Top 100's page link to be crawled
 * @param {*} settings.type The configuration type
 */
const createFetchingJob = ({ cronTime, key, pagelink, type }) => {
  logger.info(`Scheduling job with cron format: ${cronTime}`);
  logger.info(`Creating the cron job to fetch '${type}' tracks from ${pagelink} with Youtube Data API key: ${key}`);
  return schedule.scheduleJob(cronTime, () => {
    logger.info(`Start job to fetch '${type}' tracks`);
    debug(cronTime);
    logger.info('Start child process ' + moment().format());
    const child = fork('fetch.js', [key, pagelink, type], {
      silent: true,
      cwd: `${__dirname}`
    });
    child.on('error', (err) => {
      logger.error(`ERROR: spawn failed! (${err})`);
    });
    child.on('exit', (code, signal) => {
      logger.info('Exit child process ' + moment().format());
      logger.info(`Exit code: ${code}`);
      if (signal) {
        logger.info(`Signal: ${signal}`);
      }
    });
    child.stderr.on('data', (data) => {
      logger.error(`stderr: ${data}`);
    });
    child.stdout.on('data', (data) => {
      debug(`stdout: ${data}`);
    });
  });  
};

/**
 * @typedef {Object} FetchConfig
 * @property {string} cronTime 
 * @property {string} key 
 * @property {string} link
 */
/**
 * @param {Object.<string, FetchConfig} config The configured settings with different types
 */
const setupFetchingJobs = (config) => {
  let jobs = [];
  Object.keys(config).forEach((type) => {
    let {cronTime, key, link: pagelink} = config[type];
    if (cronTime && key && pagelink) {
      jobs.push(createFetchingJob({cronTime, key, pagelink, type}));
    }
  });
  return jobs;
};

module.exports = {
  setupFetchingJobs,
  createFetchingJob
};