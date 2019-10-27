import Base from './base';

/* global YT */

class Content extends Base {
  constructor(tracks) {
    super();

    this.element = {
      content: document.getElementById('content'),
      video: document.getElementById('video'),
      topPlaylist: document.getElementById('top-playlist'),
      videoOverlay: null,
    };
    this._mediaQuery = window.matchMedia('(max-width: 600px)');

    this._topPlaylist = [];
    this.player = null;
    this._recordIndex = -1;
    this._isPlayerFirstBuffering = false;
    this._isRepeat = false;
    this._isShuffle = false;
    this._isShuffleMapSet = false;

    this.adjustDisplayMode();
    this._setPlayer(tracks);
    this._setEventListeners();
  }

  adjustDisplayMode() {
    if (this._mediaQuery.matches) {
      // Mobile mode (window max-width <= 600px)
      document.body.appendChild(this.element['topPlaylist']);
    } else {
      // Desktop mode (window max-width > 600px)
      this.element['content'].appendChild(this.element['topPlaylist']);
    }
  }

  _setPlayer(tracks) {
    if (!tracks || tracks.length <= 0) {
      console.log('Oops! Track data not found.');
      return;
    }

    this._initializePlayer(tracks);

    // Load Youtube player API
    let tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  _setEventListeners() {
    // Listen if matches the media query
    this._mediaQuery.addListener(this.adjustDisplayMode.bind(this));
  }

  /**
   * @typedef {Object} Track
   * @property {number} num The top rank number
   * @property {string} title The track's title
   * @property {string} artists The track's artist(s)
   * @property {string} imglink The track's album artwork image link
   * @property {string|null} video_id The track's Youtube video ID
   */
  /**
   * @param {Track[]} tracks The tracks to initialize Youtube player and top playlist
   */
  _initializePlayer(tracks) {
    this._topPlaylist = tracks.filter((track) => track['video_id'] != null);
    let videoIds = this._topPlaylist.map((track) => track['video_id']);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube Iframe API Ready');
      this.player = new YT.Player('video-iframe', {
        height: '100%',
        width: '100%',
        events: {
          'onReady': window.onPlayerReady,
          'onStateChange': window.onPlayerStateChange,
          'onError': window.onPlayerError
        },
        playerVars: {
          playlist: videoIds.join(),
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          autoplay: 1,
          loop: 1,
          wmode: 'transparent',
          modestbranding: 1,
        },
      });
    };

    window.onPlayerReady = (event) => {
      if (!event || !event.target) {
        console.log('Youtube Player not Ready');
        return;
      }

      let playlistIndex = event.target.getPlaylistIndex();
      // console.log(playlistIndex);
      if (playlistIndex < 0) {
        console.log('Youtube Player\'s playlist not Ready, reloading...');
        location.reload();
        return;
      }
      console.log('Youtube Player Ready');

      // Generate top playlist from tracks
      this._topPlaylist.forEach((track, i) => {
        let { num, title, artists, imglink, video_id: videoId } = track;
        let artistsNode = document.createElement('div');
        artistsNode.innerHTML = artists;
        let titleNode = document.createElement('div');
        titleNode.setAttribute('class', 'title');
        titleNode.innerHTML = title;
        let rightNode = document.createElement('div');
        rightNode.setAttribute('class', 'right');
        rightNode.appendChild(titleNode);
        rightNode.appendChild(artistsNode);
        let leftNode = document.createElement('div');
        leftNode.setAttribute('class', 'left');
        let style = `background-image: url("${imglink}");background-size: cover;`;
        leftNode.setAttribute('style', style);
        let numNode = document.createElement('div');
        numNode.setAttribute('class', 'num');
        numNode.innerHTML = num;
        let trackNode = document.createElement('div');
        trackNode.setAttribute('class', 'track');
        trackNode.setAttribute('id', `${videoId}-${i}`);
        trackNode.appendChild(numNode);
        trackNode.appendChild(leftNode);
        trackNode.appendChild(rightNode);
        trackNode.addEventListener('touchend', (event) => {
          // Solution for Opera mini issue: loading stuck for the first time after touchended
          // Pass to click event listener
          if (!this._isPlayerFirstBuffering) {
            return;
          }

          event.preventDefault();

          if (this._isShuffle) {
            if (this._isShuffleMapSet) {
              this.player.playVideoAt(this.shuffleIndexMap.get(i));
            } else {
              // Because Youtube player playlist is only updated when BUFFERING state started,
              // the shuffleIndexMap is not initialized for the first time.
              // Therefore, record the index of the clicked track node.
              this._recordIndex = i;
              // And then call nextVideo() to trigger BUFFERING state.
              this.player.nextVideo();
            }
            return;
          }

          this.player.playVideoAt(i);
        });
        trackNode.addEventListener('click', (event) => {
          event.preventDefault();

          if (this._isShuffle) {
            if (this._isShuffleMapSet) {
              this.player.playVideoAt(this.shuffleIndexMap.get(i));
            } else {
              this._recordIndex = i;
              this.player.nextVideo();
            }
            return;
          }

          this.player.playVideoAt(i);
        });
        this.element['topPlaylist'].appendChild(trackNode);
      });   
      
      // Add video overlay when Youtube player ready
      this._initializeVideoOverlay();

      // Solution for Safari 11 issue: CUED state not emitted when Youtube Player ready
      setInterval(() => {
        this.emit(Content.CUED);
      }, 1000);  
    };

    window.onPlayerStateChange = (event) => {
      // Clear timer
      if (this.player.timer) {
        clearInterval(this.player.timer);
      }

      let playerState = event.data;
      console.log(playerState);

      /**
       * PLAYER BUFFERING
       */
      if (playerState == YT.PlayerState.BUFFERING) {
        if (!this._isPlayerFirstBuffering) this._isPlayerFirstBuffering = true;

        if (this._isShuffle && !this._isShuffleMapSet) {
          let {shuffleIndexMap, originIndexMap} = this._getShuffleMap(this.player.getPlaylist());
          this.shuffleIndexMap = shuffleIndexMap;
          this.originIndexMap = originIndexMap;
          this._isShuffleMapSet = true;

          if (this._recordIndex != -1) {
            this.player.playVideoAt(this.shuffleIndexMap.get(this._recordIndex));
            this._recordIndex = -1;
            return;
          }
        }        

        // Set color background to the track nodes in top playlist
        let playlistIndex = event.target.getPlaylistIndex();
        let topPlaylistIndex = (this._isShuffle)? this.originIndexMap.get(playlistIndex): playlistIndex;
        let track = this._topPlaylist[topPlaylistIndex];
        let currentVideoId = track['video_id'];

        this._topPlaylist.forEach((track, i) => {
          let { video_id: videoId } = track;
          document.getElementById(`${videoId}-${i}`).style.backgroundColor = 
          (videoId == currentVideoId && i == topPlaylistIndex)
          ? '#e6f596'
          : '';
        });

        this.emit(Content.BUFFERING, track);

      /**
       * PLAYER UNSTARTED
       */
      } else if (playerState == -1) {
        // If state is unstarted for a while, set up a timer to play next video
        this.player.timer = setInterval(() => {
          this.player.nextVideo();
        }, 10000);

      /**
       * PLAYER PLAYING
       */
      } else if (playerState == YT.PlayerState.PLAYING) {
        this.emit(Content.PLAYING);
      
      /**
       * PLAYER PAUSED
       */
      } else if (playerState == YT.PlayerState.PAUSED) {
        this.emit(Content.PAUSED);

      /**
       * PLAYER CUED
       */  
      } else if (playerState == YT.PlayerState.CUED) {
        this.emit(Content.CUED);

      /**
       * PLAYER ENDED
       */ 
      } else if (playerState == YT.PlayerState.ENDED) {
        if (this._isRepeat) {
          this.player.stopVideo();
          this.player.previousVideo();
        }
      }
    };

    window.onPlayerError = (event) => {
      console.error(event);
    };
  }

  /**
   * @param {*} playlist The shuffled playlist
   */
  _getShuffleMap(playlist) {
    // Set up mapping from video ID to origin indexes
    let videoIdIndexesMap = new Map();
    this._topPlaylist.forEach((track, i) => {
      let {video_id: videoId} = track;
      if (videoIdIndexesMap.has(videoId)) {
        let indexes = videoIdIndexesMap.get(videoId);
        indexes.push(i);
        videoIdIndexesMap.set(videoId, indexes);
      } else {
        videoIdIndexesMap.set(videoId, [i]);
      }
    });

    // Set up mapping from the shuffled playlist index to origin index
    let originIndexMap = new Map();
    for (let shuffledIndex = playlist.length - 1; shuffledIndex >= 0; shuffledIndex--) {
      let videoId = playlist[shuffledIndex];
      originIndexMap.set(shuffledIndex, videoIdIndexesMap.get(videoId).pop());
    }

    // Set up mapping from origin index to shuffled playlist index
    let shuffleIndexMap = new Map();
    for (const [key, value] of originIndexMap.entries()) {
      shuffleIndexMap.set(value, key);
    }

    return {
      shuffleIndexMap,
      originIndexMap,
    };
  }

  _initializeVideoOverlay() {
    let videoOverlay = document.createElement('div');
    videoOverlay.setAttribute('class', 'video-overlay');
    videoOverlay.setAttribute('id', 'video-overlay');
    this.element['video'].appendChild(videoOverlay);
    this.element['videoOverlay'] = document.getElementById('video-overlay');
    this.element['videoOverlay'].addEventListener('touchend', (event) => {
      event.preventDefault();
      this.element['videoOverlay'].removeAttribute('style');
      this.emit(Content.OVERLAY_CLICKED);
    });
    this.element['videoOverlay'].addEventListener('click', (event) => {
      event.preventDefault();
      this.element['videoOverlay'].removeAttribute('style');
      this.emit(Content.OVERLAY_CLICKED);
    });
  }

  openOverlay() {
    if (this.element['videoOverlay']) {
      this.element['videoOverlay'].style.display = 'block';
    }
  }

  hideOverlay() {
    if (this.element['videoOverlay']) {
      this.element['videoOverlay'].removeAttribute('style');
    }
  }

  setRepeat(isRepeat) {
    this._isRepeat = isRepeat;
  }

  setShuffle(isShuffle) {
    this.player.setShuffle(isShuffle); // If true, will shuffle the playlist at BUFFERING state
    this._isShuffle = isShuffle;
    if (!isShuffle) {
      this._isShuffleMapSet = false;
    }
  }

  isTopPlaylistClicked(event) {
    let playlist = this.element['topPlaylist'];
    if (event.target == playlist || event.target.parentNode == playlist
      || (event.target.parentNode && event.target.parentNode.parentNode == playlist)
      || (event.target.parentNode.parentNode 
        && event.target.parentNode.parentNode.parentNode == playlist)) {
      return true;
    }
    return false;
  }

  unMute() {
    this.player.unMute();
  }

  getVolume() {
    return (this.player.isMuted())
    ? 0
    : this.player.getVolume();
  }

  getState() {
    let playerState = this.player.getPlayerState();
    switch (playerState) {
      case YT.PlayerState.BUFFERING:
        return Content.BUFFERING;
      case -1:
        return Content.UNSTART;
      case YT.PlayerState.PLAYING:
        return Content.PLAYING;
      case YT.PlayerState.PAUSED:
        return Content.PAUSED;
      case YT.PlayerState.CUED:
        return Content.CUED;
      case YT.PlayerState.ENDED:
        return Content.ENDED;    
      default:
        return Content.UNKNOWN;
    }
  }

  playVideo() {
    this.player.playVideo();
  }

  playPreviousVideo() {
    this.player.previousVideo();
  }

  playNextVideo() {
    this.player.nextVideo();
  }

  pauseVideo() {
    this.player.pauseVideo();
  }

  getVideoElapsedSeconds() {
    return parseInt(this.player.getCurrentTime());
  }

  getVideoDuration() {
    return this.player.getDuration();
  }
}

Content.OVERLAY_CLICKED = Symbol('OVERLAY_CLICKED');
Content.BUFFERING = Symbol('BUFFERING');
Content.UNSTART = Symbol('UNSTART');
Content.PLAYING = Symbol('PLAYING');
Content.PAUSED = Symbol('PAUSED');
Content.CUED = Symbol('CUED');
Content.ENDED = Symbol('ENDED');
Content.UNKNOWN = Symbol('UNKNOWN');

export default Content;