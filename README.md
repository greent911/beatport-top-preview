# Beatport Top Preview

A Node.js web app to track the Beatport top 100s and generate full length music playlists via Youtube

[https://bp-top-preview.herokuapp.com/beatport](https://bp-top-preview.herokuapp.com/beatport)

[![Build Status](https://travis-ci.com/greent911/beatport-top-preview.svg?token=RsyxacQEXqVr2voXy1sY&branch=master)](https://travis-ci.com/greent911/beatport-top-preview)

>Some of preview clips on Beatport Top 100 are not good enough for the listeners. Therefore, I decided to create an application to find full length tracks on YouTube and automatically generate the top 100 music playlists. This application gives users an efficient way to listen and purchase tracks from Beatport.com.

![image](https://github.com/greent911/beatport-top-preview/blob/master/bp-top-preview.png)
![image](https://github.com/greent911/beatport-top-preview/blob/master/bp-top-preview-m.png)

## Setup
#### 1. Database setup
You'll need to:
- Have a MySQL Database
- Create database and table from the script: [migration/db.sql](migration/db.sql)
#### 2. Request Youtube Data API keys
The tutorial: https://developers.google.com/youtube/v3/getting-started
#### 3. Setup a .env file to setup your environment variables
```
# DB config
DBCONFIG_USERNAME=root
DBCONFIG_PASSWORD=password
DBCONFIG_DATABASE=database_development
DBCONFIG_HOST=127.0.0.1

# Youtube Data API keys for tracking genres
GENRE_TOP100_KEY=<YOUR_API_KEY>
GENRE_PSYTRANCE_KEY=<YOUR_API_KEY_2>

# Scheduling to fetch genre data with cron format
# Ex: Execute every 22:49
GENRE_TOP100_CRONSTR=0 49 22 * * *
GENRE_PSYTRANCE_CRONSTR=0 49 22 * * *
```
#### 4. Install
```
npm install
npm run devstart
```
Wait for cron jobs finished.
Then visit http://localhost:3000/beatport

