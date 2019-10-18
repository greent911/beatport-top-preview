import Base from './base';
/* global YT */
class Content extends Base {
  constructor(tracks) {
    super();

    this.element = {
      content: document.getElementById('content'),
      video: document.getElementById('video'),
      playlist: document.getElementById('playlist'),
      videoOverlay: null,
    };
    this._mediaQuery = window.matchMedia('(max-width: 600px)');

    this._playlistTracks = [];

    this.player = null;

    this._isRepeat = false;
    this._firstBuffering = false;
    this._isShuffle = false;
    this._isShuffleMapSet = false;

    this.clickedIndex = -1;

    this.adjustDisplayMode();
    this._setPlayer(tracks);
    this._setEventListeners();
  }

  adjustDisplayMode() {
    if (this._mediaQuery.matches) {
      // Mobile mode (window max-width <= 600px)
      document.body.appendChild(this.element['playlist']);
    } else {
      // Desktop mode (window max-width > 600px)
      this.element['content'].appendChild(this.element['playlist']);
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

  _initializePlayer(tracks) {
    this._playlistTracks = tracks.filter((track) => track['video_id'] != null);
    let videoIds = this._playlistTracks.map((track) => track['video_id']);

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

      this._playlistTracks.forEach((track, i) => {
        let {num, title, artists, imglink, video_id: videoId} = track;
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
          if (!this._firstBuffering) {
            return;
          }

          event.preventDefault();

          if (this._isShuffle) {
            if (this._isShuffleMapSet) {
              this.player.playVideoAt(this.shuffleIndexMap.get(i));
            } else {
              // Youtube player playlist is only updated when BUFFERING state started.
              // The shuffleIndexMap is not initialized for the first time.
              // Therefore, record the index of the clicked track node.
              this.clickedIndex = i;
              // Call playing nextVideo to trigger BUFFERING state
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
              this.clickedIndex = i;
              this.player.nextVideo();
            }
            return;
          }

          this.player.playVideoAt(i);
        });
        this.element['playlist'].appendChild(trackNode);
      });   
      
      // Add video overlay after Youtube iframe generated
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

      if (playerState == YT.PlayerState.BUFFERING) {
        if (!this._firstBuffering) this._firstBuffering = true;

        if (this._isShuffle && !this._isShuffleMapSet) {
          this.setShuffleMap();
          if (this.clickedIndex != -1) {
            this.player.playVideoAt(this.shuffleIndexMap.get(this.clickedIndex));
            this.clickedIndex = -1;
            return;
          }
        }

        let playlistIndex = event.target.getPlaylistIndex();

        if (this._isShuffle) {
          playlistIndex = this.originIndexMap.get(playlistIndex);
        }

        let track = this._playlistTracks[playlistIndex];
        let currentVideoId = track['video_id'];
        videoIds.forEach((videoId, i) => {
          document.getElementById(`${videoId}-${i}`).style.backgroundColor = (videoId == currentVideoId && i == playlistIndex)? '#e6f596': '';
        });
        this.emit(Content.BUFFERING, track);
      } else if (playerState == -1) {
        // If state is unstarted for a while, set up a timer to play next video
        this.player.timer = setInterval(() => {
          this.player.nextVideo();
        }, 10000);
      } else if (playerState == YT.PlayerState.PLAYING) {
        this.emit(Content.PLAYING);
      } else if (playerState == YT.PlayerState.PAUSED) {
        this.emit(Content.PAUSED);
      } else if (playerState == YT.PlayerState.CUED) {
        this.emit(Content.CUED);
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
    this.player.setShuffle(isShuffle); // If true, change the video IDs order
    this._isShuffle = isShuffle;
    if (!isShuffle) {
      this._isShuffleMapSet = false;
    }
  }
  setShuffleMap() {
    if (this._isShuffle && !this._isShuffleMapSet) {
      // Get current video IDs which are shuffled
      let shuffledVideoIds = this.player.getPlaylist();

      // Set up mapping from video ID to its origin indexes
      let videoIdIndexesMap = new Map();
      this._playlistTracks.forEach((track, i) => {
        let {video_id: videoId} = track;
        if (videoIdIndexesMap.has(videoId)) {
          let indexes = videoIdIndexesMap.get(videoId);
          indexes.push(i);
          videoIdIndexesMap.set(videoId, indexes);
        } else {
          videoIdIndexesMap.set(videoId, [i]);
        }
      });

      // Set up mapping from shuffled index to origin index
      this.originIndexMap = new Map();
      for (let shuffledIndex = shuffledVideoIds.length - 1; shuffledIndex >= 0; shuffledIndex--) {
        let videoId = shuffledVideoIds[shuffledIndex];
        this.originIndexMap.set(shuffledIndex, videoIdIndexesMap.get(videoId).pop());
      }

      // Set up mapping from origin index to shuffled index
      this.shuffleIndexMap = new Map();
      for (const [key, value] of this.originIndexMap.entries()) {
        this.shuffleIndexMap.set(value, key);
      }
      this._isShuffleMapSet = true;
    }
  }
}

Content.OVERLAY_CLICKED = Symbol('OVERLAY_CLICKED');
Content.BUFFERING = Symbol('BUFFERING');
Content.PLAYING = Symbol('PLAYING');
Content.PAUSED = Symbol('PAUSED');
Content.CUED = Symbol('CUED');

export default Content;