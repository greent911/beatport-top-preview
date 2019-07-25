# Beatport Top Preview

A Node.js web app to track the Beatport top 100s and generate music video playlists with Youtube Data API

[https://bp-top-preview.herokuapp.com/beatport](https://bp-top-preview.herokuapp.com/beatport)

>It seems to me that 2 minute previews of psy-trance tracks on Beatport are still too short. Therefore, I decided to create an application with full tracks preview and automatically generated playlists via Youtube (...I had already wasted too much time manually querying music videos on Youtube...). This application also provides a feature to link to the origin Beatport track page. If you like a track after listening, please support the author and purchase it on Beatport!

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

