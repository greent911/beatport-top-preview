# Beatport Top Preview

A Node.js web app to track the Beatport top 100s and generate Youtube playlists

[https://bp-top-preview.herokuapp.com/beatport](https://bp-top-preview.herokuapp.com/beatport)

[![Build Status](https://travis-ci.com/greent911/beatport-top-preview.svg?token=RsyxacQEXqVr2voXy1sY&branch=master)](https://travis-ci.com/greent911/beatport-top-preview)

>Some of preview clips on Beatport Top 100 are not good enough for the listeners. Therefore, I decided to create an application to find full length music videos on YouTube and automatically generate the top 100 playlists. This application gives users an efficient way to preview music before purchasing on Beatport.com.

![image](https://github.com/greent911/beatport-top-preview/blob/master/bp-top-preview.png)
![image](https://github.com/greent911/beatport-top-preview/blob/master/bp-top-preview-m.png)

## Features
- **[Node.js](https://nodejs.org)** with **[Express.js](https://github.com/expressjs/express)** framework
- **Web Crawler** using **[node-crawler](http://nodecrawler.org/)**
- Fetching Youtube data using **[Google APIs](https://github.com/googleapis/googleapis)**
- Scheduling jobs with **[Node Schedule](https://github.com/node-schedule/node-schedule)**
- **[MySQL](https://www.mysql.com/)** database with **[Sequelize](https://github.com/sequelize/sequelize)** ORM
- **RESTful API** with **[Express-validator](https://github.com/ctavan/express-validator)** middleware
- Logging with **[Morgan](https://github.com/expressjs/morgan)** and **[Winston](https://github.com/winstonjs/winston)**
- Frontend implementation with responsive web design
- Bundling frontend code with **[Webpack 4](https://webpack.js.org)**
- **Unit Testing** using **[Mocha](https://mochajs.org/)**, **[Chai](https://www.chaijs.com/)**, **[Sinon.JS](https://sinonjs.org/)** and **[node-mocks-http](https://github.com/howardabrams/node-mocks-http)**
- Error handling enhancement with custom errors and full stack traces
- Config variables management

## Express Project Structure
```
  beatport-top-yt-preview/
  ├── bin
  │   └── www                             # start point
  ├── config                              # configurations based on the environment
  │   ├── db                              # configuration of database
  │   │   ├── development.js                    
  │   │   ├── test.js                    
  │   │   ├── production.js                   
  │   │   └── index.js
  │   ├── fetch                           # configuration of fetching track
  │   │   ├── default.json                    
  │   │   ├── development.js                    
  │   │   ├── test.js                    
  │   │   ├── production.js                   
  │   │   └── index.js
  │   └── index.js
  ├── controllers                         # validate and sanitize request data, then send to services
  ├── core                                # fetching script and scheduler
  ├── errors                              # custom errors
  │   ├── AppError.js                     # custom error interface
  │   ├── DatabaseError.js                # database error
  │   └── index.js                        
  ├── frontend                            # frontend source files
  ├── middlewares                         # request middlewares
  │   ├── errorHandler.js                 # error handling middleware                
  │   ├── notFoundHandler.js              # 404 not found handling middleware             
  │   └── requestValidationHandler.js     # request validation middlewares   
  ├── models                              # database access
  ├── public                              # frontend compiled files
  ├── routes                              # route HTTP requests to the controllers
  ├── services                            # business logic
  ├── test
  ├── utils
  │   └── logger.js                                             
  ├── app.js                              # express setup                            
  ├── package.json                        
  └── webpack.config.js
```

## Usage: Fetcher API
#### 1. Crawling Beatport top 100's page
```js
const BeatportTopFetcher = require('beatport-top-fetcher');
let fetcher = new BeatportTopFetcher();
fetcher.crawl('https://www.beatport.com/top-100')
  .then((data) => {
    console.log(data);
  });
```
#### 2. Fetching Beatport top 100's track data
```js
const BeatportTopFetcher = require('beatport-top-fetcher');
let fetcher = new BeatportTopFetcher('your Youtube API key here');
fetcher.fetchTracks('https://www.beatport.com/top-100')
  .then((tracks) => {
    console.log(tracks);
  });
```
#### 3. Fetching Beatport top 100's track data with specific fields
```js
const BeatportTopFetcher = require('beatport-top-fetcher');
let fetcher = new BeatportTopFetcher('your Youtube API key here');
let fields = ['num', 'title', 'artists'];
fetcher.fetchTracks('https://www.beatport.com/top-100')
  .then((tracks) => {
    console.log(tracks);
    // tracks = [{
    //  num: 1,
    //  title: 'XXX',
    //  artists: 'YYY, ZZZ',
    // }, ...more ]
  });
```
The fields include: ```num```, ```title```, ```artists```, ```remixers```, ```labels```, ```genre```, ```released```, ```link```, ```imglink```, ```video_id```
## Development Server Setup
#### 1. Database
You'll need to:
- Have a MySQL Database
- Create database and table from the script: [migration/db.sql](migration/db.sql)
#### 2. Request Youtube Data API keys
The tutorial: https://developers.google.com/youtube/v3/getting-started
#### 3. Create a .env file to set up your environment variables
```
# DB config
DBCONFIG_USERNAME=root
DBCONFIG_PASSWORD=password
DBCONFIG_DATABASE=database_development
DBCONFIG_HOST=127.0.0.1

# Set up different Youtube Data API keys for fetching track data with different types
FETCH_TOP100_KEY=<YOUR_API_KEY>
FETCH_PSYTRANCE_KEY=<YOUR_API_KEY>

# Scheduling to fetch data with cron format
# Ex: Execute every 22:49
FETCH_TOP100_CRONTIME=0 49 22 * * *
FETCH_PSYTRANCE_CRONTIME=0 49 22 * * *
```
#### 4. Install
```
$ npm install
$ npm run build
$ npm run devstart
```
Wait for scheduling jobs finished.
Then visit http://localhost:3000/beatport

